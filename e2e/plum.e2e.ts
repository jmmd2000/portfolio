import postgres from "postgres";
import type { Browser, Page } from "@playwright/test";
import { e2eEnvironment } from "./environment";
import { expect, test } from "./fixtures";

interface PlumSetup {
  food: number;
  happiness: number;
  energy: number;
  /** She sleeps at night and when tired. Unless a test says otherwise, she's kept awake, whatever time it runs */
  asleep?: boolean;
}

async function setPlum({ food, happiness, energy, asleep = false }: PlumSetup): Promise<void> {
  const client = postgres(e2eEnvironment.DATABASE_URL_TEST_E2E, { max: 1, onnotice: () => {} });
  const awakeUntil = asleep ? null : new Date(Date.now() + 24 * 60 * 60 * 1000);
  try {
    await client`insert into plum (id, food, happiness, energy, awake_until) values (1, ${food}, ${happiness}, ${energy}, ${awakeUntil})
      on conflict (id) do update set food = excluded.food, happiness = excluded.happiness, energy = excluded.energy, awake_until = excluded.awake_until`;
  } finally {
    await client.end();
  }
}

/** A second visitor in their own browser, kept off other sites like the main page */
async function secondVisitor(browser: Browser): Promise<Page> {
  const context = await browser.newContext({ baseURL: "http://localhost:4173", extraHTTPHeaders: { "x-forwarded-for": "127.0.0.2" } });
  const page = await context.newPage();
  await page.route(
    url => url.hostname !== "localhost",
    route => route.abort()
  );
  return page;
}

function band(page: Page) {
  return page.getByRole("region", { name: "Plum" });
}

test("feeding her raises her food, plays her eating sprite and counts the cooldown down", async ({ page }) => {
  await setPlum({ food: 30, happiness: 50, energy: 100 });
  await page.goto("/");
  const foodWord = band(page).locator("dd").first();
  const foodBefore = await foodWord.textContent();

  await band(page).getByRole("button", { name: "Feed" }).click();

  await expect(band(page).getByRole("img", { name: "Plum, eating" })).toBeVisible();
  await expect(foodWord).not.toHaveText(foodBefore ?? "");
  await expect(band(page).getByRole("button", { name: /^Feed again in \d+s$/ })).toBeDisabled();
});

test("she refuses food when she's full, and the button stays free", async ({ page }) => {
  await setPlum({ food: 95, happiness: 50, energy: 100 });
  await page.goto("/");

  await band(page).getByRole("button", { name: "Feed" }).click();

  await expect(band(page).getByRole("img", { name: "Plum, turning her nose up at the food" })).toBeVisible();
  await expect(band(page).getByRole("button", { name: "Feed" })).toBeEnabled();
});

test("asleep, she refuses food and purrs in her sleep when petted, and playing wakes her up", async ({ page }) => {
  await setPlum({ food: 30, happiness: 50, energy: 10, asleep: true });
  await page.goto("/");
  await expect(band(page).getByRole("img", { name: "Plum, asleep" })).toBeVisible();

  await band(page).getByRole("button", { name: "Feed" }).click();
  await expect(band(page).getByRole("status")).toBeVisible();
  await expect(band(page).getByRole("img", { name: "Plum, asleep" })).toBeVisible();
  await expect(band(page).getByRole("button", { name: "Feed" })).toBeEnabled();

  await band(page).getByRole("button", { name: "Pet" }).click();
  await expect(band(page).getByRole("img", { name: "Plum, purring in her sleep" })).toBeVisible();

  await band(page).getByRole("button", { name: "Play" }).click();
  await expect(band(page).getByRole("img", { name: "Plum, asleep" })).toHaveCount(0);

  await band(page).getByRole("button", { name: "Feed" }).click();
  await expect(band(page).getByRole("img", { name: "Plum, eating" })).toBeVisible();
});

test("another visitor sees a feed within 10 seconds, with her eating sprite", async ({ page, browser }) => {
  await setPlum({ food: 30, happiness: 50, energy: 100 });
  const otherPage = await secondVisitor(browser);
  await otherPage.clock.install();
  await otherPage.goto("/");
  await page.goto("/");
  await expect(band(otherPage).getByRole("button", { name: "Feed" })).toBeEnabled();

  await band(page).getByRole("button", { name: "Feed" }).click();
  await expect(band(page).getByRole("img", { name: "Plum, eating" })).toBeVisible();
  await otherPage.clock.fastForward(10_000);

  await expect(band(otherPage).getByRole("img", { name: "Plum, eating" })).toBeVisible();
  await expect(band(otherPage).getByRole("button", { name: /^Feed again in \d+s$/ })).toBeDisabled();
  await otherPage.context().close();
});

test("the server counts at most one throw a second from each visitor", async ({ request }) => {
  // Its own address, so this limit can't refuse another test's throws
  const headers = { "x-forwarded-for": "203.0.113.9" };

  expect((await request.post("/api/plum/throws", { headers })).status()).toBe(200);
  expect((await request.post("/api/plum/throws", { headers })).status()).toBe(429);
});

test.describe("with reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("her sprite stays on its first frame", async ({ page }) => {
    await setPlum({ food: 80, happiness: 80, energy: 100 });
    await page.goto("/");

    await band(page).getByRole("button", { name: "Pet" }).click();
    const sprite = band(page).getByRole("img", { name: "Plum, purring" });
    await expect(sprite).toBeVisible();

    // Notes every frame shown for a second, long enough for the purring sprite's three frames to play if it moved
    const framesShown = await sprite.evaluate(
      element =>
        new Promise<string[]>(resolve => {
          const frames = [element.getAttribute("data-frame") ?? ""];
          const observer = new MutationObserver(() => frames.push(element.getAttribute("data-frame") ?? ""));
          observer.observe(element, { attributes: true, attributeFilter: ["data-frame"] });
          setTimeout(() => {
            observer.disconnect();
            resolve(frames);
          }, 1000);
        })
    );

    expect(new Set(framesShown)).toEqual(new Set(["0"]));
  });

  test("she stays in her pen when let out, and says why", async ({ page }) => {
    await setPlum({ food: 80, happiness: 80, energy: 100 });
    await page.goto("/");

    await band(page).getByRole("button", { name: "Let her out" }).click();

    await expect(band(page).getByRole("status")).toBeVisible();
    await expect(band(page).getByRole("img", { name: "Plum, sitting" })).toBeVisible();
    await expect(page.locator(".plum-ball")).toHaveCount(0);
  });

  test("she plays no idle animations", async ({ page }) => {
    await setPlum({ food: 80, happiness: 80, energy: 100 });
    await page.clock.install();
    await page.goto("/");
    const sprite = band(page).getByRole("img", { name: "Plum, sitting" });
    await expect(sprite).toBeVisible();

    // Notes every sprite she shows over 30 seconds, long enough for at least two idles if they played
    await sprite.evaluate(element => {
      const labels: string[] = [];
      Object.assign(window, { spriteLabels: labels });
      new MutationObserver(() => labels.push(element.getAttribute("aria-label") ?? "")).observe(element, { attributes: true, attributeFilter: ["aria-label"] });
    });
    for (let step = 0; step < 60; step += 1) {
      await page.clock.runFor(500);
    }
    const labels = await page.evaluate(() => ("spriteLabels" in window ? window.spriteLabels : null));

    expect(labels).toEqual([]);
  });
});

test("her pen shows her asleep with the buttons off when her data can't be read, and the page still loads", async ({ page }) => {
  const client = postgres(e2eEnvironment.DATABASE_URL_TEST_E2E, { max: 1, onnotice: () => {} });
  try {
    await client`alter table plum rename to plum_unreachable`;
    const response = await page.goto("/");

    expect(response?.status()).toBe(200);
    await expect(band(page).getByRole("img", { name: "Plum, asleep" })).toBeVisible();
    for (const name of ["Feed", "Pet", "Play"]) {
      await expect(band(page).getByRole("button", { name })).toBeDisabled();
    }
  } finally {
    await client`alter table plum_unreachable rename to plum`;
    await client.end();
  }
});

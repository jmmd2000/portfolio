import { describe, expect, it } from "vitest";
import { parseOpenLibraryBooks } from "./openLibrary";

describe("parseOpenLibraryBooks", () => {
  it("builds the medium and large covers from the cover id, with the first author and year", () => {
    const [book] = parseOpenLibraryBooks({ docs: [{ title: "To Kill a Mockingbird", author_name: ["Harper Lee", "Someone Else"], first_publish_year: 1960, cover_i: 14351077 }] });

    expect(book).toEqual({
      title: "To Kill a Mockingbird",
      subtitle: "Harper Lee · 1960",
      thumbnailURL: "https://covers.openlibrary.org/b/id/14351077-M.jpg",
      coverURL: "https://covers.openlibrary.org/b/id/14351077-L.jpg",
    });
  });

  it("leaves out books with no cover, and keeps at most five", () => {
    const docs = [{ title: "No cover" }, ...[1, 2, 3, 4, 5, 6].map(coverID => ({ title: `Book ${coverID}`, cover_i: coverID }))];

    expect(parseOpenLibraryBooks({ docs }).map(book => book.title)).toEqual(["Book 1", "Book 2", "Book 3", "Book 4", "Book 5"]);
  });
});

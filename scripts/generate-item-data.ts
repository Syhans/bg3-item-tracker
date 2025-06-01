import * as Papa from "papaparse";
import * as fs from "fs";

const URLS = [
  // act 1
  "https://docs.google.com/spreadsheets/d/1HSM_U4-TspsgoJ5FsT2b-38gWVoOsaIN2ATC6A3FP14/export?format=csv&gid=0",
  // act 2
  "https://docs.google.com/spreadsheets/d/1HSM_U4-TspsgoJ5FsT2b-38gWVoOsaIN2ATC6A3FP14/export?format=csv&gid=1427789417",
  // act 3
  "https://docs.google.com/spreadsheets/d/1HSM_U4-TspsgoJ5FsT2b-38gWVoOsaIN2ATC6A3FP14/export?format=csv&gid=309772712",
] as const;

async function getSheetData(url: string): Promise<string[][]> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch the sheet: ${res.statusText}`);
  }
  const text = await res.text();
  return new Promise((resolve, reject) => {
    Papa.parse(text, {
      complete: (results) => {
        if (results.errors.length > 0) {
          // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
          reject(results.errors);
        } else {
          resolve(results.data as string[][]);
        }
      },
    });
  });
}

interface Item {
  id: number;
  generalArea: string;
  type: string;
  name: string;
  effect: string[];
  source: string;
  location: string;
}

type ItemWithoutId = Omit<Item, "id">;

const generalAreaHints: Record<string, string> = {};
function parseSheetData(data: string[][]): ItemWithoutId[] {
  let generalArea = ""; // 0
  let type = ""; // 2
  let name = ""; // 3
  let effect: string[] = []; // 6
  let source = ""; // 11
  let location = ""; // 15

  const items: ItemWithoutId[] = [];

  for (const row of data) {
    // Handle general area changes FIRST, before processing items
    if (row[0] && !row[0].startsWith("End of Act")) {
      // Save current item before changing areas
      if (name && name !== "Name") {
        items.push({
          generalArea, // Use the OLD area for the current item
          type,
          name,
          effect,
          source,
          location,
        });
        // Reset after saving
        type = "";
        name = "";
        effect = [];
      }

      generalArea = row[0];

      if (row[2]?.includes(" ")) {
        // if hint, one word = type => ignore
        if (generalArea !== "General information") {
          generalAreaHints[generalArea] = row[2];
          continue;
        }
      }
    }

    // Handle new items (when both type and name are present)
    if (row[2] && row[3]) {
      // Save previous item before starting new one
      if (name && name !== "Name") {
        items.push({
          generalArea,
          type,
          name,
          effect,
          source,
          location,
        });

        // Reset for new item, handle edge cases
        if (
          ![
            "Sussur Greatsword",
            "Sussur Dagger",
            "Infernal Spear",
            "Vicious Battleaxe",
            "Dolor Amarus",
          ].includes(name)
        ) {
          effect = [];
        }
        type = "";
        name = "";
      }
    }

    // Update current item properties
    if (row[2]) {
      type = row[2];
    }
    if (row[3]) {
      name = row[3];
    }
    if (row[6]) {
      effect.push(row[6]);
    }
    if (row[11]) {
      source = row[11];
    }
    if (row[15]) {
      location = row[15];
    }
  }

  // Save last item
  if (name && name !== "Name") {
    items.push({
      generalArea,
      type,
      name,
      effect,
      source,
      location,
    });
  }

  return items;
}

const act1Data = await getSheetData(URLS[0]);
const act2Data = await getSheetData(URLS[1]);
const act3Data = await getSheetData(URLS[2]);

const act1Items = parseSheetData(act1Data);
const act2Items = parseSheetData(act2Data);
const act3Items = parseSheetData(act3Data);

// Check if all items are present in each act
function checkAllPresent(
  data: string[][],
  items: ItemWithoutId[],
  act: string
) {
  const target = new Set(
    data.map((row) => row[3]).filter((name) => name && name !== "Name")
  );
  const actual = new Set(items.map((item) => item.name));
  const mismatch1 = target.difference(actual);
  if (mismatch1.size > 0) {
    console.warn(
      `[${act}]: The following items should be in the items JSON, but are not: ${Array.from(
        mismatch1
      ).join(", ")}`
    );
  }
  const mismatch2 = actual.difference(target);
  if (mismatch2.size > 0) {
    console.warn(
      `[${act}]: The following items are in the items JSON, but should not be: ${Array.from(
        mismatch2
      ).join(", ")}`
    );
  }
}
checkAllPresent(act1Data, act1Items, "Act 1");
checkAllPresent(act2Data, act2Items, "Act 2");
checkAllPresent(act3Data, act3Items, "Act 3");

let index = 0;
const act1ItemsWithId: Item[] = act1Items.map((item) => ({
  id: index++,
  ...item,
}));
const act2ItemsWithId: Item[] = act2Items.map((item) => ({
  id: index++,
  ...item,
}));
const act3ItemsWithId: Item[] = act3Items.map((item) => ({
  id: index++,
  ...item,
}));

// export data
if (!fs.existsSync("./src/data")) {
  fs.mkdirSync("./src/data");
}
fs.writeFileSync(
  "./src/data/act1.json",
  JSON.stringify(act1ItemsWithId, null, 2)
);
fs.writeFileSync(
  "./src/data/act2.json",
  JSON.stringify(act2ItemsWithId, null, 2)
);
fs.writeFileSync(
  "./src/data/act3.json",
  JSON.stringify(act3ItemsWithId, null, 2)
);
fs.writeFileSync("./src/data/act1.min.json", JSON.stringify(act1ItemsWithId));
fs.writeFileSync("./src/data/act2.min.json", JSON.stringify(act2ItemsWithId));
fs.writeFileSync("./src/data/act3.min.json", JSON.stringify(act3ItemsWithId));

fs.writeFileSync(
  "./src/data/general-area-hints.json",
  JSON.stringify(generalAreaHints, null, 2)
);

const typesContent = `export interface Item {
  id: number;
  generalArea: string;
  type: string;
  name: string;
  effect: string[];
  source: string;
  location: string;
}
`;
fs.writeFileSync("./src/types/item.ts", typesContent);

const generalAreaHintsContent = `export type GeneralAreaHints = Record<string, string>;`;
fs.writeFileSync("./src/types/general-area-hints.ts", generalAreaHintsContent);

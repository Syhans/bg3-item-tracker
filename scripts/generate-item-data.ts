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
  generalArea: string;
  type: string;
  name: string;
  effect: string[];
  source: string;
  location: string;
  id: string;
}

type ItemWithoutId = Omit<Item, "id">;

function parseSheetData(data: string[][]): ItemWithoutId[] {
  // console.log(data);
  let generalArea = ""; // 0
  // let generalAreaHint = ""; // 2 if generalArea is not empty
  let type = ""; // 2
  let name = ""; // 3
  let effect: string[] = []; // 6
  let source = ""; // 11
  let location = ""; // 15

  const generalAreaHints: Record<string, string> = {};

  const items: ItemWithoutId[] = [];

  for (const row of data) {
    if (row[2] && row[3] && row[6]) {
      // new item
      if (name) {
        // save current item and reset
        items.push({
          generalArea,
          type,
          name,
          effect,
          source,
          location,
        });
        type = "";
        name = "";
        effect = [];
      }
    }
    if (row[0] && !row[0].startsWith("End of Act")) {
      // new general area
      generalArea = row[0];
      if (row[2]?.includes(" ")) {
        // if hint, one word = type => ignore
        generalAreaHints[generalArea] = row[2];
      }
    }
    if (row[2]) {
      type = row[2]; // 2
    }
    if (row[3]) {
      name = row[3]; // 3
    }
    if (row[6]) {
      effect.push(row[6]); // 6
    }
    if (row[11]) {
      source = row[11]; // 11
    }
    if (row[15]) {
      location = row[15]; // 15
    }
  }
  // save last item
  if (name) {
    items.push({
      generalArea,
      type,
      name,
      effect,
      source,
      location,
    });
  }
  return items.slice(1);
}

const act1Data = await getSheetData(URLS[0]);
const act2Data = await getSheetData(URLS[1]);
const act3Data = await getSheetData(URLS[2]);

const act1Items = parseSheetData(act1Data);
const act2Items = parseSheetData(act2Data);
const act3Items = parseSheetData(act3Data);

const act1ItemsWithId: Item[] = act1Items.map((item, index) => ({
  id: `act1-${String(index + 1)}`,
  ...item,
}));
const act2ItemsWithId: Item[] = act2Items.map((item, index) => ({
  id: `act2-${String(index + 1)}`,
  ...item,
}));
const act3ItemsWithId: Item[] = act3Items.map((item, index) => ({
  id: `act3-${String(index + 1)}`,
  ...item,
}));

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

const typesContent = `export interface Item {
  id: string;
  generalArea: string;
  type: string;
  name: string;
  effect: string[];
  source: string;
  location: string;
}
`;
fs.writeFileSync("./src/types/item.ts", typesContent);

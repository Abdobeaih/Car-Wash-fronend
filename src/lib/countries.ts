import rawCountries from "world-countries";

export interface CountryOption {
  name: string;
  cca2: string;
  dialCode: string;
  flag: string;
}

function flagEmoji(cca2: string): string {
  return cca2
    .toUpperCase()
    .replace(/./g, (c) => String.fromCodePoint(127397 + c.charCodeAt(0)));
}

export const countries: CountryOption[] = rawCountries
  .filter((c) => c.idd?.root)
  .map((c) => ({
    name: c.name.common,
    cca2: c.cca2,
    dialCode: c.idd.root + (c.idd.suffixes?.[0] ?? ""),
    flag: flagEmoji(c.cca2),
  }))
  .sort((a, b) => a.name.localeCompare(b.name));
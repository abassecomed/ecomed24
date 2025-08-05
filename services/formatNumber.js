export const formatNumber = (number) => {
  if (number === null || number === undefined) {
    return;
  }

  return number?.toLocaleString("de-DE") + " FCFA";
};

export const formatNumberWithoutFCFA = (number) => {
  if (number === null || number === undefined) {
    return;
  }

  return number?.toLocaleString("de-DE");
};

export function formatNumberOfPatients(number) {
  if (number == null || isNaN(number)) {
    return "";
  }

  const numStr = number.toString();

  const [integerPart, decimalPart] = numStr.split(".");

  const formattedIntegerPart = integerPart.replace(
    /\B(?=(\d{3})+(?!\d))/g,
    "."
  );

  return decimalPart && decimalPart !== "0"
    ? `${formattedIntegerPart},${decimalPart} " FCFA"`
    : formattedIntegerPart + " FCFA";
}

export function formatNumberEU(value) {
  const numberValue = typeof value === "string" ? parseFloat(value) : value;

  if (isNaN(numberValue)) {
    return value;
  }

  return new Intl.NumberFormat("de-DE").format(numberValue) + " FCFA";
}

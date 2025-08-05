export function numberToWordsFR(n) {
  const unite = [
    "", "un", "deux", "trois", "quatre", "cinq",
    "six", "sept", "huit", "neuf", "dix",
    "onze", "douze", "treize", "quatorze", "quinze", "seize",
  ];

  const dizaine = [
    "", "", "vingt", "trente", "quarante", "cinquante",
    "soixante", "soixante", "quatre-vingt", "quatre-vingt"
  ];

  const getBelow100 = (n) => {
    if (n < 17) return unite[n];
    if (n < 20) return "dix-" + unite[n - 10];
    if (n < 70) {
      let d = dizaine[Math.floor(n / 10)];
      let u = n % 10;
      return d + (u === 1 ? "-et-un" : u ? "-" + unite[u] : "");
    }
    if (n < 80) return "soixante-" + getBelow100(n - 60);
    return "quatre-vingt" + (n === 80 ? "s" : "-" + getBelow100(n - 80));
  };

  const getBelow1000 = (n) => {
    const centaine = Math.floor(n / 100);
    const reste = n % 100;
    let str = "";
    if (centaine) {
      str += centaine === 1 ? "cent" : unite[centaine] + " cent";
      if (reste === 0 && centaine > 1) str += "s";
      if (reste > 0) str += " ";
    }
    return str + getBelow100(reste);
  };

  if (n === 0) return "zéro";
  let parts = [];
  if (n >= 1_000_000) {
    const millions = Math.floor(n / 1_000_000);
    parts.push(
      (millions > 1 ? getBelow1000(millions) + " millions" : "un million")
    );
    n %= 1_000_000;
  }
  if (n >= 1000) {
    const milliers = Math.floor(n / 1000);
    parts.push(
      (milliers > 1 ? getBelow1000(milliers) + " mille" : "mille")
    );
    n %= 1000;
  }
  if (n > 0) {
    parts.push(getBelow1000(n));
  }
  return parts.join(" ");
}

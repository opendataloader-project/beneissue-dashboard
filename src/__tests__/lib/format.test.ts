import {
  formatCurrencyKRW,
  formatCurrencyUSD,
  formatDateShort,
  formatDelta,
  formatHours,
  formatMonth,
  formatNumber,
  formatPercent,
  formatSeconds,
} from "@/lib/format";

describe("formatNumber", () => {
  describe("Happy Path", () => {
    it("should format integer with Korean locale", () => {
      expect(formatNumber(1234567)).toBe("1,234,567");
    });

    it("should round decimal values", () => {
      expect(formatNumber(1234.56)).toBe("1,235");
    });
  });

  describe("Edge Cases", () => {
    it("should format zero", () => {
      expect(formatNumber(0)).toBe("0");
    });

    it("should format negative numbers", () => {
      expect(formatNumber(-1234)).toBe("-1,234");
    });

    it("should handle small numbers", () => {
      expect(formatNumber(5)).toBe("5");
    });
  });
});

describe("formatCurrencyKRW", () => {
  describe("Happy Path - Scale Formatting", () => {
    it("should format values >= 100,000,000 as 억원", () => {
      expect(formatCurrencyKRW(150000000)).toBe("1.5억원");
      expect(formatCurrencyKRW(100000000)).toBe("1.0억원");
    });

    it("should format values >= 10,000 as 만원", () => {
      expect(formatCurrencyKRW(50000)).toBe("5만원");
      expect(formatCurrencyKRW(10000)).toBe("1만원");
      expect(formatCurrencyKRW(123456)).toBe("12만원");
    });

    it("should format small values with currency symbol", () => {
      expect(formatCurrencyKRW(5000)).toBe("₩5,000");
      expect(formatCurrencyKRW(999)).toBe("₩999");
    });
  });

  describe("Edge Cases", () => {
    it("should format zero", () => {
      expect(formatCurrencyKRW(0)).toBe("₩0");
    });

    it("should handle boundary value (exactly 10000)", () => {
      expect(formatCurrencyKRW(10000)).toBe("1만원");
    });

    it("should handle boundary value (exactly 100000000)", () => {
      expect(formatCurrencyKRW(100000000)).toBe("1.0억원");
    });

    it("should handle values just below boundaries", () => {
      expect(formatCurrencyKRW(9999)).toBe("₩9,999");
      expect(formatCurrencyKRW(99999999)).toBe("10000만원");
    });
  });

  describe("Rounding", () => {
    it("should round 억원 to 1 decimal place", () => {
      expect(formatCurrencyKRW(123456789)).toBe("1.2억원");
    });

    it("should round 만원 to whole number", () => {
      expect(formatCurrencyKRW(15678)).toBe("2만원");
    });
  });
});

describe("formatCurrencyUSD", () => {
  describe("Happy Path", () => {
    it("should format with $ symbol and 2 decimals", () => {
      expect(formatCurrencyUSD(1234.56)).toBe("$1,234.56");
    });

    it("should always show 2 decimal places", () => {
      expect(formatCurrencyUSD(100)).toBe("$100.00");
    });
  });

  describe("Edge Cases", () => {
    it("should format zero", () => {
      expect(formatCurrencyUSD(0)).toBe("$0.00");
    });

    it("should format small decimals", () => {
      expect(formatCurrencyUSD(0.01)).toBe("$0.01");
    });

    it("should round to 2 decimal places", () => {
      expect(formatCurrencyUSD(10.999)).toBe("$11.00");
    });

    it("should handle large numbers", () => {
      expect(formatCurrencyUSD(1000000)).toBe("$1,000,000.00");
    });
  });
});

describe("formatPercent", () => {
  describe("Happy Path", () => {
    it("should format with default 1 decimal place", () => {
      expect(formatPercent(75.5)).toBe("75.5%");
    });

    it("should format with custom decimal places", () => {
      expect(formatPercent(75.567, 2)).toBe("75.57%");
      expect(formatPercent(75, 0)).toBe("75%");
    });
  });

  describe("Edge Cases", () => {
    it("should format zero", () => {
      expect(formatPercent(0)).toBe("0.0%");
    });

    it("should format 100%", () => {
      expect(formatPercent(100)).toBe("100.0%");
    });

    it("should handle values over 100%", () => {
      expect(formatPercent(150.5)).toBe("150.5%");
    });

    it("should handle negative percentages", () => {
      expect(formatPercent(-25.5)).toBe("-25.5%");
    });
  });
});

describe("formatDelta", () => {
  describe("Happy Path", () => {
    it("should add + sign for positive values", () => {
      expect(formatDelta(25.5)).toBe("+25.5%");
    });

    it("should keep - sign for negative values", () => {
      expect(formatDelta(-15.3)).toBe("-15.3%");
    });
  });

  describe("Edge Cases", () => {
    it("should add + sign for zero", () => {
      expect(formatDelta(0)).toBe("+0.0%");
    });

    it("should format very small positive value", () => {
      expect(formatDelta(0.1)).toBe("+0.1%");
    });

    it("should round to 1 decimal place", () => {
      expect(formatDelta(25.55)).toBe("+25.6%");
    });
  });
});

describe("formatSeconds", () => {
  describe("Happy Path - Time Scale Conversion", () => {
    it("should format seconds under 60 as 초", () => {
      expect(formatSeconds(45)).toBe("45초");
    });

    it("should format 60-3599 seconds as 분", () => {
      expect(formatSeconds(120)).toBe("2분");
      expect(formatSeconds(3599)).toBe("60분");
    });

    it("should format 3600+ seconds as 시간", () => {
      expect(formatSeconds(3600)).toBe("1.0시간");
      expect(formatSeconds(7200)).toBe("2.0시간");
    });
  });

  describe("Edge Cases", () => {
    it("should format zero", () => {
      expect(formatSeconds(0)).toBe("0초");
    });

    it("should round seconds", () => {
      expect(formatSeconds(45.6)).toBe("46초");
    });

    it("should round minutes", () => {
      expect(formatSeconds(90)).toBe("2분");
    });

    it("should show decimal for hours", () => {
      expect(formatSeconds(5400)).toBe("1.5시간");
    });
  });

  describe("Boundary Cases", () => {
    it("should handle exactly 60 seconds as 분", () => {
      expect(formatSeconds(60)).toBe("1분");
    });

    it("should handle exactly 3600 seconds as 시간", () => {
      expect(formatSeconds(3600)).toBe("1.0시간");
    });

    it("should handle 59 seconds as 초", () => {
      expect(formatSeconds(59)).toBe("59초");
    });
  });
});

describe("formatHours", () => {
  describe("Happy Path", () => {
    it("should format hours >= 1 as 시간", () => {
      expect(formatHours(8)).toBe("8시간");
      expect(formatHours(1)).toBe("1시간");
    });

    it("should format hours < 1 as 분", () => {
      expect(formatHours(0.5)).toBe("30분");
    });
  });

  describe("Edge Cases", () => {
    it("should round hours", () => {
      expect(formatHours(8.6)).toBe("9시간");
    });

    it("should round minutes", () => {
      expect(formatHours(0.75)).toBe("45분");
    });

    it("should handle exactly 1 hour", () => {
      expect(formatHours(1)).toBe("1시간");
    });

    it("should handle very small hours", () => {
      expect(formatHours(0.1)).toBe("6분");
    });
  });
});

describe("formatMonth", () => {
  describe("Happy Path", () => {
    it("should format YYYY-MM to Korean format", () => {
      expect(formatMonth("2025-01")).toBe("2025년 1월");
      expect(formatMonth("2025-12")).toBe("2025년 12월");
    });

    it("should remove leading zero from month", () => {
      expect(formatMonth("2025-03")).toBe("2025년 3월");
      expect(formatMonth("2025-09")).toBe("2025년 9월");
    });
  });

  describe("Edge Cases", () => {
    it("should handle month 10-12 (two digits)", () => {
      expect(formatMonth("2025-10")).toBe("2025년 10월");
      expect(formatMonth("2025-11")).toBe("2025년 11월");
    });
  });
});

describe("formatDateShort", () => {
  describe("Happy Path", () => {
    it("should format YYYY-MM-DD to M/D format", () => {
      expect(formatDateShort("2025-01-15")).toBe("1/15");
      expect(formatDateShort("2025-12-25")).toBe("12/25");
    });
  });

  describe("Edge Cases", () => {
    it("should handle single digit month and day", () => {
      expect(formatDateShort("2025-01-05")).toBe("1/5");
    });

    it("should handle end of month dates", () => {
      expect(formatDateShort("2025-01-31")).toBe("1/31");
    });

    it("should handle first day of year", () => {
      expect(formatDateShort("2025-01-01")).toBe("1/1");
    });
  });
});

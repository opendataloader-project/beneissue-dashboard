import {
  DEFAULT_STORY_POINTS,
  DEVELOPER_RATES,
  DEVELOPER_ROLE_OPTIONS,
  getHoursFromStoryPoints,
  STORY_POINT_MAPPINGS,
} from "@/data/developer-rates";

describe("getHoursFromStoryPoints", () => {
  describe("Happy Path - Known Story Points", () => {
    it("should return 4 hours for 1 SP", () => {
      expect(getHoursFromStoryPoints(1)).toBe(4);
    });

    it("should return 12 hours for 2 SP", () => {
      expect(getHoursFromStoryPoints(2)).toBe(12);
    });

    it("should return 32 hours for 3 SP", () => {
      expect(getHoursFromStoryPoints(3)).toBe(32);
    });

    it("should return 64 hours for 5 SP", () => {
      expect(getHoursFromStoryPoints(5)).toBe(64);
    });

    it("should return 96 hours for 8 SP", () => {
      expect(getHoursFromStoryPoints(8)).toBe(96);
    });
  });

  describe("Edge Cases - Unknown Story Points", () => {
    it("should return default (12 hours) for unmapped SP value (4)", () => {
      // Given: 4 SP is not in the mapping
      // When
      const result = getHoursFromStoryPoints(4);

      // Then: should return default (2 SP = 12 hours)
      expect(result).toBe(12);
    });

    it("should return default (12 hours) for SP = 0", () => {
      expect(getHoursFromStoryPoints(0)).toBe(12);
    });

    it("should return default (12 hours) for negative SP", () => {
      expect(getHoursFromStoryPoints(-1)).toBe(12);
    });

    it("should return default (12 hours) for very large SP", () => {
      expect(getHoursFromStoryPoints(100)).toBe(12);
    });

    it("should return default (12 hours) for decimal SP", () => {
      expect(getHoursFromStoryPoints(2.5)).toBe(12);
    });
  });
});

describe("DEVELOPER_RATES", () => {
  describe("Data Integrity", () => {
    it("should have all required developer roles", () => {
      const expectedRoles = [
        "application_developer",
        "system_developer",
        "it_pm",
        "it_architect",
        "data_analyst",
      ];

      expectedRoles.forEach((role) => {
        expect(
          DEVELOPER_RATES[role as keyof typeof DEVELOPER_RATES]
        ).toBeDefined();
      });
    });

    it("should have positive hourly rates for all roles", () => {
      Object.values(DEVELOPER_RATES).forEach((rate) => {
        expect(rate.hourlyRateKRW).toBeGreaterThan(0);
        expect(rate.hourlyRateUSD).toBeGreaterThan(0);
      });
    });

    it("should have consistent KRW to USD conversion (~1400 rate)", () => {
      Object.values(DEVELOPER_RATES).forEach((rate) => {
        const calculatedUSD = rate.hourlyRateKRW / 1400;
        // Allow 1% tolerance for rounding
        expect(rate.hourlyRateUSD).toBeCloseTo(calculatedUSD, 0);
      });
    });

    it("should have Korean and English labels for all roles", () => {
      Object.values(DEVELOPER_RATES).forEach((rate) => {
        expect(rate.labelKo).toBeTruthy();
        expect(rate.labelEn).toBeTruthy();
        expect(rate.labelKo.length).toBeGreaterThan(0);
        expect(rate.labelEn.length).toBeGreaterThan(0);
      });
    });
  });

  describe("Specific Rate Values (2025 SW Association)", () => {
    it("should have correct rate for application_developer", () => {
      const rate = DEVELOPER_RATES.application_developer;
      expect(rate.hourlyRateKRW).toBe(42133);
      expect(rate.hourlyRateUSD).toBe(30.09);
    });

    it("should have correct rate for it_architect (highest)", () => {
      const rate = DEVELOPER_RATES.it_architect;
      expect(rate.hourlyRateKRW).toBe(61576);
      expect(rate.hourlyRateUSD).toBe(43.98);
    });

    it("should have correct rate for system_developer (lowest)", () => {
      const rate = DEVELOPER_RATES.system_developer;
      expect(rate.hourlyRateKRW).toBe(37009);
      expect(rate.hourlyRateUSD).toBe(26.44);
    });
  });
});

describe("STORY_POINT_MAPPINGS", () => {
  describe("Data Integrity", () => {
    it("should have 5 story point mappings", () => {
      expect(STORY_POINT_MAPPINGS).toHaveLength(5);
    });

    it("should have mappings for standard Fibonacci points", () => {
      const points = STORY_POINT_MAPPINGS.map((m) => m.points);
      expect(points).toEqual([1, 2, 3, 5, 8]);
    });

    it("should have increasing avgHours as story points increase", () => {
      for (let i = 1; i < STORY_POINT_MAPPINGS.length; i++) {
        expect(STORY_POINT_MAPPINGS[i].avgHours).toBeGreaterThan(
          STORY_POINT_MAPPINGS[i - 1].avgHours
        );
      }
    });

    it("should have valid day ranges (min <= max)", () => {
      STORY_POINT_MAPPINGS.forEach((mapping) => {
        expect(mapping.maxDays).toBeGreaterThanOrEqual(mapping.minDays);
      });
    });

    it("should have both Korean and English descriptions", () => {
      STORY_POINT_MAPPINGS.forEach((mapping) => {
        expect(mapping.descriptionKo).toBeTruthy();
        expect(mapping.descriptionEn).toBeTruthy();
      });
    });
  });

  describe("avgHours Calculation Validation", () => {
    it("should have avgHours within reasonable range of day estimates", () => {
      STORY_POINT_MAPPINGS.forEach((mapping) => {
        const minHours = mapping.minDays * 8;
        const maxHours =
          mapping.maxDays === Infinity ? 160 : mapping.maxDays * 8;

        // avgHours should be between min and max (with some flexibility for 0-day minimum)
        if (mapping.minDays > 0) {
          expect(mapping.avgHours).toBeGreaterThanOrEqual(minHours * 0.5);
        }
        expect(mapping.avgHours).toBeLessThanOrEqual(maxHours * 1.5);
      });
    });
  });
});

describe("Constants", () => {
  it("should have DEFAULT_STORY_POINTS as 2", () => {
    expect(DEFAULT_STORY_POINTS).toBe(2);
  });

  it("should have DEVELOPER_ROLE_OPTIONS matching DEVELOPER_RATES keys", () => {
    const rateKeys = Object.keys(DEVELOPER_RATES).sort();
    const optionKeys = [...DEVELOPER_ROLE_OPTIONS].sort();
    expect(optionKeys).toEqual(rateKeys);
  });
});

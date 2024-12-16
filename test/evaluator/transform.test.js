const { describe, it, expect } = require('@xufa/testing');
const { transform, clone, S } = require('../../lib');

function calculateAge(birthDate, otherDate) {
  const tgtDate = otherDate || new Date();
  let years = tgtDate.getFullYear() - birthDate.getFullYear();
  if (
    tgtDate.getMonth() < birthDate.getMonth() ||
    (tgtDate.getMonth() === birthDate.getMonth() && tgtDate.getDate() < birthDate.getDate())
  ) {
    years -= 1;
  }
  return years;
}

function removeDuplicates(obj) {
  if (Array.isArray(obj)) {
    return [...new Set(obj)];
  }
  if (S.isObject(obj)) {
    const result = clone(obj);
    Object.keys(result).forEach((key) => {
      result[key] = removeDuplicates(result[key]);
    });
    return result;
  }
  return obj;
}

describe('transform', () => {
  it('Should transform an object based on its values and object paths to a source object', () => {
    const input = {
      name: 'John',
      surname: 'Doe',
      measures: {
        age: 45,
        height: 176,
        weight: 75,
      },
      data: [1, 2, 3],
    };

    const transformation = {
      personalData: {
        name: '@name',
        surname: '@surname',
        title: 'Mr.',
        age: '@measures.age',
        control: '@@something',
      },
      kpis: {
        height: '@measures.height',
        weight: '@measures.weight',
        control: '@data[1]',
      },
      kpisArr: ['@measures.height', '@measures.weight', '@data[1]'],
      id: 7,
    };
    const expected = {
      personalData: {
        name: 'John',
        surname: 'Doe',
        title: 'Mr.',
        age: 45,
        control: '@something',
      },
      kpis: {
        height: 176,
        weight: 75,
        control: 2,
      },
      kpisArr: [176, 75, 2],
      id: 7,
    };

    const actual = transform(input, transformation);
    expect(actual).toEqual(expected);
  });
  it('Should use default values that are strings', () => {
    const input = {
      name: 'John',
    };

    const transformation = {
      personalData: {
        name: '@name',
        surname: '@surname || "Doe"',
      },
    };
    const expected = {
      personalData: {
        name: 'John',
        surname: 'Doe',
      },
    };
    const actual = transform(input, transformation);
    expect(actual).toEqual(expected);
  });
  it('Should use default values that are integers', () => {
    const input = {
      name: 'John',
    };

    const transformation = {
      personalData: {
        name: '@name',
        age: '@age || 45',
      },
    };
    const expected = {
      personalData: {
        name: 'John',
        age: 45,
      },
    };
    const actual = transform(input, transformation);
    expect(actual).toEqual(expected);
  });
  it('Should use default values that are float', () => {
    const input = {
      name: 'John',
    };

    const transformation = {
      personalData: {
        name: '@name',
        age: '@age || 45.4',
      },
    };
    const expected = {
      personalData: {
        name: 'John',
        age: 45.4,
      },
    };
    const actual = transform(input, transformation);
    expect(actual).toEqual(expected);
  });
  it('Should use default values that are strings surronded by double quotes', () => {
    const input = {
      name: 'John',
    };

    const transformation = {
      personalData: {
        name: '@name',
        age: '@age || "45.4"',
      },
    };
    const expected = {
      personalData: {
        name: 'John',
        age: '45.4',
      },
    };
    const actual = transform(input, transformation);
    expect(actual).toEqual(expected);
  });
  it('Should use default values that are booleans', () => {
    const input = {
      name: 'John',
    };

    const transformation = {
      personalData: {
        name: '@name',
        checked: '@age || true',
      },
    };
    const expected = {
      personalData: {
        name: 'John',
        checked: true,
      },
    };
    const actual = transform(input, transformation);
    expect(actual).toEqual(expected);
  });

  it('Should be able to manage functions and extra context', () => {
    const input = {
      params: {
        birthday: '1976-05-29',
      },
    };
    const transformation = {
      age: '@calculateAge(new Date(params.birthday), new Date("2022-05-15"))',
    };
    const expected = { age: 45 };
    const actual = transform(input, transformation, { calculateAge, Date });
    expect(actual).toEqual(expected);
  });

  it('Should pipe additional functions to whole object', () => {
    const input = {
      paramA: [1, 2, 3],
      paramB: 'L1',
      paramC: 'L1',
      paramD: 'L2',
      paramE: ['a', 'a', 'b'],
      paramF: { a: 1, b: 2, c: 3 },
      paramH: [4, 4, 6],
      paramI: 'R1',
      paramJ: 'R2',
      paramK: 'R2',
      paramG: ['c', 'd', 'd'],
    };

    const transformation = {
      __apply__: [
        {
          pipe: ['removeDuplicates'],
        },
      ],
      SectionA: {
        SectionA1: '@paramA',
        SectionA2: ['@paramB', '@paramC', '@paramD'],
        SectionA3: '@paramE',
        SectionA4: '@paramF',
      },
      SectionB: {
        SectionB1: '@paramH',
        SectionB2: ['@paramI', '@paramJ', '@paramK'],
        SectionB3: '@paramG',
      },
    };

    const expected = {
      SectionA: {
        SectionA1: [1, 2, 3],
        SectionA2: ['L1', 'L2'],
        SectionA3: ['a', 'b'],
        SectionA4: { a: 1, b: 2, c: 3 },
      },
      SectionB: {
        SectionB1: [4, 6],
        SectionB2: ['R1', 'R2'],
        SectionB3: ['c', 'd'],
      },
    };
    const actual = transform(input, transformation, {
      calculateAge,
      Date,
      removeDuplicates,
    });
    expect(actual).toEqual(expected);
  });
  it('Should pipe additional functions to expected fields', () => {
    const input = {
      paramA: [1, 2, 3],
      paramB: 'L1',
      paramC: 'L1',
      paramD: 'L2',
      paramE: ['a', 'a', 'b'],
      paramF: { a: 1, b: 2, c: 3 },
      paramH: [4, 4, 6],
      paramI: 'R1',
      paramJ: 'R2',
      paramK: 'R2',
      paramG: ['c', 'd', 'd'],
    };

    const transformation = {
      __apply__: [
        {
          pipe: ['removeDuplicates'],
          paths: ['SectionA.C', 'SectionB.C'],
        },
      ],
      SectionA: {
        A: '@paramA',
        B: ['@paramB', '@paramC', '@paramD'],
        C: '@paramE',
        D: '@paramF',
      },
      SectionB: {
        A: '@paramH',
        B: ['@paramI', '@paramJ', '@paramK'],
        C: '@paramG',
      },
    };

    const expected = {
      SectionA: {
        A: [1, 2, 3],
        B: ['L1', 'L1', 'L2'],
        C: ['a', 'b'],
        D: { a: 1, b: 2, c: 3 },
      },
      SectionB: {
        A: [4, 4, 6],
        B: ['R1', 'R2', 'R2'],
        C: ['c', 'd'],
      },
    };
    const actual = transform(input, transformation, {
      calculateAge,
      Date,
      removeDuplicates,
    });
    expect(actual).toEqual(expected);
  });
});

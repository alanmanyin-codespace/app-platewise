import { describe, expect, it } from 'vitest';
import { calc } from './calc';

describe('calc', () => {
    it('handles plain numbers', () => {
        expect(calc('0')).toBe(0);
        expect(calc('42')).toBe(42);
        expect(calc('3.14')).toBeCloseTo(3.14);
        expect(calc('.5')).toBeCloseTo(0.5);
        expect(calc('1.')).toBeCloseTo(1);
    });

    it('handles whitespace', () => {
        expect(calc('  1 +   2 ')).toBe(3);
        expect(calc('\n( 2 + 3 ) * 4\t')).toBe(20);
    });

    it('supports addition and subtraction', () => {
        expect(calc('1+2+3')).toBe(6);
        expect(calc('10-3-2')).toBe(5); // (10-3)-2
        expect(calc('10-(3-2)')).toBe(9);
    });

    it('supports multiplication and division', () => {
        expect(calc('2*3*4')).toBe(24);
        expect(calc('2x3x4')).toBe(24);
        expect(calc('2 x 3 X 4')).toBe(24);
        expect(calc('8/2/2')).toBe(2); // (8/2)/2
        expect(calc('7/2')).toBeCloseTo(3.5);
    });

    it('respects operator precedence (* and / before + and -)', () => {
        expect(calc('1+2*3')).toBe(7);
        expect(calc('(1+2)*3')).toBe(9);
        expect(calc('(1+2)x3')).toBe(9);
        expect(calc('10-6/2')).toBe(7);
    });

    it('supports unary + and -', () => {
        expect(calc('-1')).toBe(-1);
        expect(calc('+1')).toBe(1);
        expect(calc('-(1+2)')).toBe(-3);
        expect(calc('--2')).toBe(2);
        expect(calc('2*-3')).toBe(-6);
        expect(calc('2x-3')).toBe(-6);
        expect(calc('2/-4')).toBeCloseTo(-0.5);
    });

    it('supports power via ** (right-associative)', () => {
        expect(calc('2**3')).toBe(8);
        expect(calc('2**3**2')).toBe(512); // 2 ** (3 ** 2)
        expect(calc('(2**3)**2')).toBe(64);
    });

    it('supports power via ^ (right-associative)', () => {
        expect(calc('2^3')).toBe(8);
        expect(calc('2^3^2')).toBe(512); // 2 ^ (3 ^ 2)
        expect(calc('(2^3)^2')).toBe(64);
    });

    it('power precedence vs unary (matches current parser behavior)', () => {
        // Current grammar makes unary bind tighter than power:
        // -2^2 is parsed as (-2)^(2) => 4
        expect(calc('-2^2')).toBe(4);
        expect(calc('(-2)^2')).toBe(4);
        expect(calc('-(2^2)')).toBe(-4);
    });

    it('handles mixed operators', () => {
        expect(calc('3 + 4*2/(1-5)**2')).toBeCloseTo(3 + (4 * 2) / Math.pow(1 - 5, 2));
        expect(calc('2^3 + 1')).toBe(9);
        expect(calc('2**3 + 1')).toBe(9);
        expect(calc('2^3 + 2**3')).toBe(16);
    });

    describe('throws in the console on malformed expressions', () => {
        it('throws on empty expression', () => {
            expect(() => calc('')).toThrow();
            expect(() => calc('   ')).toThrow();
        });

        it('throws on unexpected characters', () => {
            expect(() => calc('1 + a')).toThrow();
            expect(() => calc('2 & 3')).toThrow();
        });

        it('throws on malformed expressions', () => {
            expect(() => calc('1+')).toThrow();
            expect(() => calc('*2')).toThrow();
            expect(() => calc('()')).toThrow();
            expect(() => calc('(1+2')).toThrow();
            expect(() => calc('1+2)')).toThrow();
            expect(() => calc('..1')).toThrow();
            expect(() => calc('.')).toThrow();
        });
    });

    it('division by zero follows JS semantics (Infinity/-Infinity/NaN)', () => {
        expect(calc('1/0')).toBe(Number.POSITIVE_INFINITY);
        expect(calc('-1/0')).toBe(Number.NEGATIVE_INFINITY);
        expect(Number.isNaN(calc('0/0'))).toBe(true);
    });

    it('normalizes -0 to 0', () => {
        expect(Object.is(calc('-0'), -0)).toBe(false);
        expect(calc('-0')).toBe(0);
    });

    describe('math functions', () => {
        it('supports round() function', () => {
            expect(calc('round(4.5)')).toBe(5);
            expect(calc('round(4.4)')).toBe(4);
            expect(calc('round(-4.5)')).toBe(-4);
            expect(calc('round(-4.6)')).toBe(-5);
            expect(calc('round(0)')).toBe(0);
            expect(calc('round(3.14159)')).toBe(3);
        });

        it('supports floor() function', () => {
            expect(calc('floor(4.9)')).toBe(4);
            expect(calc('floor(4.1)')).toBe(4);
            expect(calc('floor(-4.1)')).toBe(-5);
            expect(calc('floor(-4.9)')).toBe(-5);
            expect(calc('floor(5)')).toBe(5);
            expect(calc('floor(0)')).toBe(0);
        });

        it('supports ceil() function', () => {
            expect(calc('ceil(4.1)')).toBe(5);
            expect(calc('ceil(4.9)')).toBe(5);
            expect(calc('ceil(-4.9)')).toBe(-4);
            expect(calc('ceil(-4.1)')).toBe(-4);
            expect(calc('ceil(5)')).toBe(5);
            expect(calc('ceil(0)')).toBe(0);
        });

        it('supports sqrt() function', () => {
            expect(calc('sqrt(4)')).toBe(2);
            expect(calc('sqrt(9)')).toBe(3);
            expect(calc('sqrt(16)')).toBe(4);
            expect(calc('sqrt(2)')).toBeCloseTo(Math.SQRT2);
            expect(calc('sqrt(0)')).toBe(0);
            expect(calc('sqrt(0.25)')).toBe(0.5);
            expect(Number.isNaN(calc('sqrt(-1)'))).toBe(true);
        });

        it('supports abs() function', () => {
            expect(calc('abs(5)')).toBe(5);
            expect(calc('abs(-5)')).toBe(5);
            expect(calc('abs(0)')).toBe(0);
            expect(calc('abs(-3.14)')).toBeCloseTo(3.14);
            expect(calc('abs(3.14)')).toBeCloseTo(3.14);
        });

        it('supports function names in different cases', () => {
            expect(calc('ROUND(4.5)')).toBe(5);
            expect(calc('Floor(4.9)')).toBe(4);
            expect(calc('CEIL(4.1)')).toBe(5);
            expect(calc('SqRt(9)')).toBe(3);
            expect(calc('ABS(-5)')).toBe(5);
        });

        it('handles functions in expressions', () => {
            expect(calc('round(4.5) + 1')).toBe(6);
            expect(calc('2 * sqrt(16)')).toBe(8);
            expect(calc('abs(-5) + abs(-3)')).toBe(8);
            expect(calc('floor(4.9) - ceil(2.1)')).toBe(1);
            expect(calc('sqrt(4) * sqrt(9)')).toBe(6);
        });

        it('handles nested function calls', () => {
            expect(calc('abs(floor(-4.5))')).toBe(5);
            expect(calc('round(sqrt(17))')).toBe(4);
            expect(calc('sqrt(abs(-16))')).toBe(4);
            expect(calc('floor(abs(-4.7))')).toBe(4);
            expect(calc('ceil(sqrt(10))')).toBe(4);
        });

        it('handles functions with complex expressions as arguments', () => {
            expect(calc('round(2 + 3.7)')).toBe(6);
            expect(calc('sqrt(4 * 4)')).toBe(4);
            expect(calc('abs(-2 * 3)')).toBe(6);
            expect(calc('floor((10 + 5) / 3)')).toBe(5);
            expect(calc('ceil(1 + 2 + 3.1)')).toBe(7);
        });

        it('handles functions in power expressions', () => {
            expect(calc('sqrt(4) ^ 2')).toBe(4);
            expect(calc('2 ** ceil(2.3)')).toBe(8);
            expect(calc('abs(-2) ** 3')).toBe(8);
            expect(calc('floor(3.9) ^ floor(2.9)')).toBe(9);
        });

        it('handles multiple functions in complex expressions', () => {
            expect(calc('sqrt(16) + floor(4.9) - ceil(2.1)')).toBe(5);
            expect(calc('abs(-2) * round(3.5) + sqrt(9)')).toBe(11);
            expect(calc('(round(4.5) + ceil(1.1)) / abs(-2)')).toBe(3.5);
        });

        it('supports sin() function', () => {
            expect(calc('sin(0)')).toBeCloseTo(0);
            expect(calc('sin(1.5707963267948966)')).toBeCloseTo(1); // π/2
            expect(calc('sin(3.141592653589793)')).toBeCloseTo(0); // π
            expect(calc('sin(-1.5707963267948966)')).toBeCloseTo(-1); // -π/2
            expect(calc('sin(6.283185307179586)')).toBeCloseTo(0); // 2π
        });

        it('supports cos() function', () => {
            expect(calc('cos(0)')).toBeCloseTo(1);
            expect(calc('cos(1.5707963267948966)')).toBeCloseTo(0); // π/2
            expect(calc('cos(3.141592653589793)')).toBeCloseTo(-1); // π
            expect(calc('cos(6.283185307179586)')).toBeCloseTo(1); // 2π
        });

        it('supports tan() function', () => {
            expect(calc('tan(0)')).toBeCloseTo(0);
            expect(calc('tan(0.7853981633974483)')).toBeCloseTo(1); // π/4
            expect(calc('tan(3.141592653589793)')).toBeCloseTo(0); // π
            expect(calc('tan(-0.7853981633974483)')).toBeCloseTo(-1); // -π/4
        });

        it('supports asin() function', () => {
            expect(calc('asin(0)')).toBeCloseTo(0);
            expect(calc('asin(1)')).toBeCloseTo(Math.PI / 2);
            expect(calc('asin(-1)')).toBeCloseTo(-Math.PI / 2);
            expect(calc('asin(0.5)')).toBeCloseTo(Math.PI / 6);
            expect(Number.isNaN(calc('asin(2)'))).toBe(true); // out of domain
            expect(Number.isNaN(calc('asin(-2)'))).toBe(true); // out of domain
        });

        it('supports acos() function', () => {
            expect(calc('acos(1)')).toBeCloseTo(0);
            expect(calc('acos(0)')).toBeCloseTo(Math.PI / 2);
            expect(calc('acos(-1)')).toBeCloseTo(Math.PI);
            expect(calc('acos(0.5)')).toBeCloseTo(Math.PI / 3);
            expect(Number.isNaN(calc('acos(2)'))).toBe(true); // out of domain
            expect(Number.isNaN(calc('acos(-2)'))).toBe(true); // out of domain
        });

        it('supports atan() function', () => {
            expect(calc('atan(0)')).toBeCloseTo(0);
            expect(calc('atan(1)')).toBeCloseTo(Math.PI / 4);
            expect(calc('atan(-1)')).toBeCloseTo(-Math.PI / 4);
            expect(calc('atan(1000)')).toBeCloseTo(Math.PI / 2, 2);
            expect(calc('atan(-1000)')).toBeCloseTo(-Math.PI / 2, 2);
        });

        it('supports degToRad() function', () => {
            expect(calc('degToRad(0)')).toBeCloseTo(0);
            expect(calc('degToRad(90)')).toBeCloseTo(Math.PI / 2);
            expect(calc('degToRad(180)')).toBeCloseTo(Math.PI);
            expect(calc('degToRad(270)')).toBeCloseTo((3 * Math.PI) / 2);
            expect(calc('degToRad(360)')).toBeCloseTo(2 * Math.PI);
            expect(calc('degToRad(-90)')).toBeCloseTo(-Math.PI / 2);
        });

        it('supports radToDeg() function', () => {
            expect(calc('radToDeg(0)')).toBeCloseTo(0);
            expect(calc('radToDeg(1.5707963267948966)')).toBeCloseTo(90); // π/2
            expect(calc('radToDeg(3.141592653589793)')).toBeCloseTo(180); // π
            expect(calc('radToDeg(4.71238898038469)')).toBeCloseTo(270); // 3π/2
            expect(calc('radToDeg(6.283185307179586)')).toBeCloseTo(360); // 2π
            expect(calc('radToDeg(-1.5707963267948966)')).toBeCloseTo(-90); // -π/2
        });

        it('supports exp() function', () => {
            expect(calc('exp(0)')).toBeCloseTo(1);
            expect(calc('exp(1)')).toBeCloseTo(Math.E);
            expect(calc('exp(2)')).toBeCloseTo(Math.E ** 2);
            expect(calc('exp(-1)')).toBeCloseTo(1 / Math.E);
            expect(calc('exp(10)')).toBeCloseTo(Math.E ** 10);
        });

        it('supports ln() and log() functions', () => {
            expect(calc('ln(1)')).toBeCloseTo(0);
            expect(calc('log(1)')).toBeCloseTo(0);
            expect(calc('ln(2.718281828459045)')).toBeCloseTo(1); // ln(e)
            expect(calc('log(2.718281828459045)')).toBeCloseTo(1); // log(e)
            expect(calc('ln(7.389056098930650)')).toBeCloseTo(2); // ln(e^2)
            expect(calc('ln(10)')).toBeCloseTo(Math.log(10));
            expect(Number.isNaN(calc('ln(-1)'))).toBe(true);
            expect(calc('ln(0)')).toBe(Number.NEGATIVE_INFINITY);
        });

        it('supports log2() function', () => {
            expect(calc('log2(1)')).toBeCloseTo(0);
            expect(calc('log2(2)')).toBeCloseTo(1);
            expect(calc('log2(4)')).toBeCloseTo(2);
            expect(calc('log2(8)')).toBeCloseTo(3);
            expect(calc('log2(1024)')).toBeCloseTo(10);
            expect(calc('log2(0.5)')).toBeCloseTo(-1);
            expect(Number.isNaN(calc('log2(-1)'))).toBe(true);
        });

        it('supports log10() function', () => {
            expect(calc('log10(1)')).toBeCloseTo(0);
            expect(calc('log10(10)')).toBeCloseTo(1);
            expect(calc('log10(100)')).toBeCloseTo(2);
            expect(calc('log10(1000)')).toBeCloseTo(3);
            expect(calc('log10(0.1)')).toBeCloseTo(-1);
            expect(calc('log10(0.01)')).toBeCloseTo(-2);
            expect(Number.isNaN(calc('log10(-1)'))).toBe(true);
        });

        it('supports fract() function', () => {
            expect(calc('fract(0)')).toBeCloseTo(0);
            expect(calc('fract(1)')).toBeCloseTo(0);
            expect(calc('fract(1.5)')).toBeCloseTo(0.5);
            expect(calc('fract(3.14)')).toBeCloseTo(0.14);
            expect(calc('fract(4.999)')).toBeCloseTo(0.999);
            expect(calc('fract(-1.5)')).toBeCloseTo(0.5); // -1.5 - floor(-1.5) = -1.5 - (-2) = 0.5
            expect(calc('fract(-2.7)')).toBeCloseTo(0.3); // -2.7 - floor(-2.7) = -2.7 - (-3) = 0.3
        });

        it('supports trunc() function', () => {
            expect(calc('trunc(0)')).toBe(0);
            expect(calc('trunc(4.9)')).toBe(4);
            expect(calc('trunc(4.1)')).toBe(4);
            expect(calc('trunc(-4.9)')).toBe(-4);
            expect(calc('trunc(-4.1)')).toBe(-4);
            expect(calc('trunc(5)')).toBe(5);
            expect(calc('trunc(-5)')).toBe(-5);
        });

        it('supports neg() function', () => {
            expect(calc('neg(0)')).toBe(0);
            expect(calc('neg(5)')).toBe(-5);
            expect(calc('neg(-5)')).toBe(5);
            expect(calc('neg(3.14)')).toBeCloseTo(-3.14);
            expect(calc('neg(-3.14)')).toBeCloseTo(3.14);
        });

        it('supports reciprocal() function', () => {
            expect(calc('reciprocal(1)')).toBe(1);
            expect(calc('reciprocal(2)')).toBeCloseTo(0.5);
            expect(calc('reciprocal(4)')).toBeCloseTo(0.25);
            expect(calc('reciprocal(0.5)')).toBeCloseTo(2);
            expect(calc('reciprocal(-2)')).toBeCloseTo(-0.5);
            expect(calc('reciprocal(0)')).toBe(Number.POSITIVE_INFINITY);
        });

        it('supports sign() function', () => {
            expect(calc('sign(0)')).toBe(0);
            expect(calc('sign(5)')).toBe(1);
            expect(calc('sign(-5)')).toBe(-1);
            expect(calc('sign(0.001)')).toBe(1);
            expect(calc('sign(-0.001)')).toBe(-1);
            expect(calc('sign(1000)')).toBe(1);
            expect(calc('sign(-1000)')).toBe(-1);
        });

        it('handles new functions in complex expressions', () => {
            expect(calc('sin(degToRad(90))')).toBeCloseTo(1);
            expect(calc('cos(degToRad(180))')).toBeCloseTo(-1);
            expect(calc('radToDeg(asin(0.5))')).toBeCloseTo(30);
            expect(calc('radToDeg(acos(0.5))')).toBeCloseTo(60);
            expect(calc('radToDeg(atan(1))')).toBeCloseTo(45);
            expect(calc('exp(ln(5))')).toBeCloseTo(5);
            expect(calc('log2(2^8)')).toBeCloseTo(8);
            expect(calc('log10(10^3)')).toBeCloseTo(3);
            expect(calc('trunc(4.9) + fract(4.9)')).toBeCloseTo(4.9);
            expect(calc('reciprocal(reciprocal(5))')).toBeCloseTo(5);
            expect(calc('neg(neg(7))')).toBe(7);
            expect(calc('sign(-5) * abs(-5)')).toBe(-5);
        });

        it('supports max() variadic function', () => {
            expect(calc('max(5)')).toBe(5);
            expect(calc('max(3, 7)')).toBe(7);
            expect(calc('max(1, 5, 3)')).toBe(5);
            expect(calc('max(-1, -5, -3)')).toBe(-1);
            expect(calc('max(0, 0, 0)')).toBe(0);
            expect(calc('max(3.14, 2.71, 1.41)')).toBeCloseTo(3.14);
            expect(calc('max(-5, 0, 5)')).toBe(5);
            expect(calc('max(100, 200, 150, 175)')).toBe(200);
        });

        it('supports min() variadic function', () => {
            expect(calc('min(5)')).toBe(5);
            expect(calc('min(3, 7)')).toBe(3);
            expect(calc('min(1, 5, 3)')).toBe(1);
            expect(calc('min(-1, -5, -3)')).toBe(-5);
            expect(calc('min(0, 0, 0)')).toBe(0);
            expect(calc('min(3.14, 2.71, 1.41)')).toBeCloseTo(1.41);
            expect(calc('min(-5, 0, 5)')).toBe(-5);
            expect(calc('min(100, 200, 150, 175)')).toBe(100);
        });

        it('supports max() with expressions as arguments', () => {
            expect(calc('max(1+1, 2+2)')).toBe(4);
            expect(calc('max(2*3, 3*2, 1+5)')).toBe(6);
            expect(calc('max(sqrt(16), sqrt(25))')).toBe(5);
            expect(calc('max(abs(-10), abs(-5))')).toBe(10);
            expect(calc('max(2^3, 3^2)')).toBe(9);
        });

        it('supports min() with expressions as arguments', () => {
            expect(calc('min(1+1, 2+2)')).toBe(2);
            expect(calc('min(2*3, 3*2, 1+5)')).toBe(6);
            expect(calc('min(sqrt(16), sqrt(25))')).toBe(4);
            expect(calc('min(abs(-10), abs(-5))')).toBe(5);
            expect(calc('min(2^3, 3^2)')).toBe(8);
        });

        it('supports max() and min() in complex expressions', () => {
            expect(calc('max(1, 2, 3) + min(1, 2, 3)')).toBe(4);
            expect(calc('max(5, 10) * min(2, 4)')).toBe(20);
            expect(calc('max(1, 2) + max(3, 4)')).toBe(6);
            expect(calc('min(10, 20) - min(5, 3)')).toBe(7);
            expect(calc('max(min(5, 10), min(3, 8))')).toBe(5);
        });

        it('supports nested max() and min()', () => {
            expect(calc('max(min(5, 10), 3)')).toBe(5);
            expect(calc('min(max(5, 10), 20)')).toBe(10);
            expect(calc('max(min(1, 2), min(3, 4))')).toBe(3);
            expect(calc('min(max(1, 2), max(3, 4))')).toBe(2);
        });
    });

    describe('throws in the console on malformed function expressions', () => {
        it('throws on missing parentheses after function', () => {
            expect(() => calc('round 4.5')).toThrow();
            expect(() => calc('sqrt 16')).toThrow();
        });

        it('throws on missing closing parenthesis', () => {
            expect(() => calc('round(4.5')).toThrow();
            expect(() => calc('sqrt(16')).toThrow();
        });

        it('throws on unknown function', () => {
            expect(() => calc('unknown(0)')).toThrow();
            expect(() => calc('foo(5)')).toThrow();
        });

        it('throws on empty function call', () => {
            expect(() => calc('round()')).toThrow();
            expect(() => calc('sqrt()')).toThrow();
        });

        it('throws on max() and min() with no arguments', () => {
            expect(() => calc('max()')).toThrow();
            expect(() => calc('min()')).toThrow();
        });
    });
});

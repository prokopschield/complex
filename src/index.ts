export function niceround(real: number) {
	const fixed = real.toFixed(12);

	if (fixed.includes(".")) {
		return fixed.replace(/\.?0+$/g, "");
	} else {
		return fixed;
	}
}

export type Real = number | bigint | string;

export class Complex implements Number {
	real = 0;
	imag = 0;

	/**
	 * Construct a complex number.
	 * @param real Can be passed a real or complex number.
	 * @param imag An optional imaginary component, must be a real number.
	 */
	constructor(real?: Complex | Real, imag?: Complex | Real) {
		if (typeof real === "number") {
			this.real = real;
		} else if (typeof real === "bigint") {
			this.real = Number(real);
		} else if (typeof real === "string") {
			Object.assign(this, Complex.eval(real));
		} else if (real instanceof Complex) {
			this.real = real.real;
			this.imag = real.imag;
		} else if (real) {
			Object.assign(this, Complex.eval(String(real)));
		}

		if (imag) {
			let imag_part = new Complex(imag);

			if (imag_part.imag && !imag_part.real) {
				this.imag += imag_part.imag;
			} else {
				this.real -= imag_part.imag;
				this.imag += imag_part.real;
			}
		}

		if (isNaN(this.real) || isNaN(this.imag)) {
			throw new Error(
				`Cannot construct complex number from [${real}, ${imag}]`
			);
		}
	}

	/** add complex numbers together */
	static add(...numbers: (Complex | Real)[]) {
		const newThis = new Complex();

		for (const n of numbers) {
			const c: Complex = n instanceof Complex ? n : new Complex(n);

			newThis.real += c.real;
			newThis.imag += c.imag;
		}

		return newThis;
	}

	/** add to this number */
	add(...numbers: (Complex | Real)[]) {
		return Complex.add(this, ...numbers);
	}

	/** subtract Rvalue(s) from Lvalue */
	static sub(Lvalue: Complex | Real, ...Rvalues: (Complex | Real)[]) {
		const newThis = new Complex(Lvalue);

		for (const n of Rvalues) {
			const c: Complex = n instanceof Complex ? n : new Complex(n);

			newThis.real -= c.real;
			newThis.imag -= c.imag;
		}

		return newThis;
	}

	/** subtract from this number */
	sub(...numbers: (Complex | Real)[]) {
		return Complex.sub(this, ...numbers);
	}

	/** multiply complex numbers together */
	static mul(...numbers: (Complex | Real)[]) {
		let real = 1;
		let imag = 0;

		for (const n of numbers) {
			const c: Complex = n instanceof Complex ? n : new Complex(n);

			const rr = real * c.real;
			const ri = real * c.imag;
			const ir = imag * c.real;
			const ii = imag * c.imag;

			real = rr - ii;
			imag = ri + ir;
		}

		return new Complex(real, imag);
	}

	/** multiply this number with other numbers */
	mul(...numbers: (Complex | Real)[]) {
		return Complex.mul(this, ...numbers);
	}

	/** divide Lvalue by Rvalue(s) */
	static div(Lvalue: Complex | Real, ...Rvalues: (Complex | Real)[]) {
		Lvalue = Lvalue instanceof Complex ? Lvalue : new Complex(Lvalue);

		let { real, imag } = Lvalue;

		for (const n of Rvalues) {
			const cn: Complex = n instanceof Complex ? n : new Complex(n);

			const a = real;
			const b = imag;
			const c = cn.real;
			const d = cn.imag;

			const den = c * c + d * d;

			real = (a * c + b * d) / den;
			imag = (b * c - a * d) / den;

			if (isNaN(real) || isNaN(imag)) {
				const nom = new Complex(a, b);
				const den = new Complex(c, d);

				throw new Error(
					`Cannot evaluate ${nom.toExponential()} / ${den}`
				);
			}
		}

		return new Complex(real, imag);
	}

	/** divide this number by other numbers */
	div(...numbers: (Complex | Real)[]) {
		return Complex.div(this, ...numbers);
	}

	/** calculate the absolute value of a number */
	static abs(n: Complex | Real) {
		return (n instanceof Complex ? n : new Complex(n)).abs;
	}

	get abs() {
		return (this.real * this.real + this.imag * this.imag) ** 0.5;
	}

	/** calculate the angle of a number in the complex plane */
	static angle(n: Complex | Real) {
		return (n instanceof Complex ? n : new Complex(n)).angle;
	}

	get angle() {
		const abs = this.abs || 1;

		return Math.atan2(this.imag / abs, this.real / abs);
	}

	/** root ** exponent */
	static pow(root: Complex | Real, exponent: Complex | Real): Complex {
		return Complex.exp(Complex.mul(exponent, Complex.log(root)));
	}

	/** this ** exponent */
	pow(exponent: Complex | Real): Complex {
		return Complex.pow(this, exponent);
	}

	/** calculates e^(terms) */
	static exp(...terms: (Complex | Real)[]) {
		const c = Complex.mul(...terms);

		return Complex.mul(
			new Complex(Math.cos(c.imag), Math.sin(c.imag)),
			Math.E ** c.real
		);
	}

	/** calculates ln(terms) */
	static log(...terms: (Complex | Real)[]) {
		const c = Complex.mul(...terms);

		return new Complex(Math.log(c.abs), c.angle);
	}

	static get E() {
		return Math.E;
	}

	static get LN10() {
		return Math.LN10;
	}

	static get LN2() {
		return Math.LN2;
	}

	static get LOG10E() {
		return Math.LOG10E;
	}

	static get LOG2E() {
		return Math.LOG2E;
	}

	static get PI() {
		return Math.PI;
	}

	static get SQRT1_2() {
		return Math.SQRT1_2;
	}

	static get SQRT2() {
		return Math.SQRT2;
	}

	toFixed(fractionDigits?: number) {
		const real = this.real.toFixed(fractionDigits);
		const imag = this.imag ? this.imag.toFixed(fractionDigits) + "j" : "";

		return imag
			? real
				? this.imag >= 0
					? `${real}+${imag}`
					: `${real}${imag}`
				: imag
			: real;
	}

	toExponential(fractionDigits?: number): string {
		if (this.imag) {
			const render: (n: number) => number | string = fractionDigits
				? (n) => (n === 1 ? "" : Number(n.toFixed(fractionDigits)))
				: (n) => (n === 1 ? "" : n);

			return `${render(this.abs)}e^${render(this.angle / Math.PI)}jπ`;
		} else {
			return this.real.toExponential(fractionDigits);
		}
	}

	toPrecision(precision?: number): string {
		return this.imag
			? this.real
				? `${this.real.toPrecision(precision)}${
						this.imag < 0 ? "" : "+"
				  }${this.imag.toPrecision(precision)}j`
				: this.imag.toPrecision(precision) + "j"
			: this.real.toPrecision(precision);
	}

	toString() {
		const real = niceround(this.real);
		const imag = niceround(this.imag) + "j";

		return imag !== "0j" && imag !== "-0j"
			? real !== "0"
				? this.imag >= 0
					? `${real}+${imag}`
					: `${real}${imag}`
				: imag
			: real;
	}

	/** alias of .abs */
	valueOf(): number {
		return this.abs;
	}

	static eval__part_is_end_of_expression(part: string): boolean {
		return (
			part === "+" ||
			part === "-" ||
			part === "*" ||
			part === "/" ||
			part === "^" ||
			part === " " ||
			part === ")" ||
			part === undefined
		);
	}

	static eval__read_expression(parts: string[]): Complex {
		while (parts[0] === " ") {
			parts.shift();
		}

		if (!parts.length) {
			return new Complex(1);
		}

		const [first] = parts.splice(0, 1);

		const first_n = Number(first);

		if (isNaN(first_n)) {
			if (first === "exp") {
				return Complex.exp(this.eval__read_expression(parts));
			}

			if (first === "ln") {
				return Complex.log(this.eval__read_expression(parts));
			}

			if (first === "e") {
				if (Complex.eval__part_is_end_of_expression(parts[0])) {
					return new Complex(Math.E);
				} else {
					return Complex.mul(
						new Complex(Math.E),
						this.eval__read_expression(parts)
					);
				}
			}

			if (first === "j") {
				if (Complex.eval__part_is_end_of_expression(parts[0])) {
					return new Complex(0, 1);
				} else {
					return Complex.mul(
						new Complex(0, 1),
						this.eval__read_expression(parts)
					);
				}
			}

			if (first === "(") {
				const c = Complex.eval__read_bracket_contents(parts);

				if (Complex.eval__part_is_end_of_expression(parts[0])) {
					return c;
				} else {
					return Complex.mul(c, Complex.eval__read_expression(parts));
				}
			}

			if (first === "-") {
				const c = Complex.eval__read_expression(parts).mul(-1);

				if (Complex.eval__part_is_end_of_expression(parts[0])) {
					return c;
				} else {
					return Complex.mul(c, Complex.eval__read_expression(parts));
				}
			}

			throw new Error(
				`Invalid expression: ${[first, ...parts].join(" ")}`
			);
		} else {
			const num = new Complex(
				parts[0] === "e" &&
				(parts[1] === "+" || parts[1] === "-") &&
				parts[2]?.match(/^\d+$/g)
					? first_n *
					  10 **
							Number(
								(parts.shift(),
								`${parts.shift()}${parts.shift()}`)
							)
					: first_n
			);

			if (Complex.eval__part_is_end_of_expression(parts[0])) {
				return num;
			} else {
				return num.mul(Complex.eval__read_expression(parts));
			}
		}
	}

	static eval__read_exponentiation(parts: string[]): Complex {
		const left = Complex.eval__read_expression(parts);

		while (parts[0] === " ") {
			parts.shift();
		}

		if (parts[0] === "^") {
			parts.shift();

			return left.pow(Complex.eval__read_exponentiation(parts));
		} else {
			return left;
		}
	}

	static eval__read_multiplication(parts: string[]): Complex {
		const left = Complex.eval__read_exponentiation(parts);

		while (parts[0] === " ") {
			parts.shift();
		}

		if (parts[0] === "*") {
			parts.shift();

			return left.mul(Complex.eval__read_multiplication(parts));
		} else if (parts[0] === "/") {
			parts.shift();

			return Complex.mul(
				left.div(Complex.eval__read_exponentiation(parts)),
				Complex.eval__read_multiplication(parts)
			);
		} else if (!Complex.eval__part_is_end_of_expression(parts[0])) {
			const L = left.mul(Complex.eval__read_expression(parts));

			parts.unshift("(", niceround(L.real), "+", niceround(L.imag), ")");

			return Complex.eval__read_multiplication(parts);
		} else {
			return left;
		}
	}

	static eval__read_addition(parts: string[]): Complex {
		while (parts[0] === " ") {
			parts.shift();
		}

		if (parts[0] === "+") {
			parts.shift();

			return Complex.eval__read_addition(parts);
		}

		if (parts[0] === "-") {
			parts.shift();

			return Complex.sub(0, Complex.eval__read_addition(parts));
		}

		const left = Complex.eval__read_multiplication(parts);

		while (parts[0] === " ") {
			parts.shift();
		}

		if (parts[0] === "+") {
			parts.shift();

			return left.add(Complex.eval__read_addition(parts));
		} else if (parts[0] === "-") {
			parts.shift();

			const right = Complex.eval__read_multiplication(parts);

			if (parts[0]?.match(/^[\+\-]$/g)) {
				parts.unshift(left.sub(right).toString());

				return Complex.eval__read_addition(parts);
			} else {
				return left.sub(right);
			}
		} else {
			return left;
		}
	}

	static eval__read_bracket_contents(parts: string[]): Complex {
		while (parts[0] === " " || parts[0] === "+") {
			parts.shift();
		}

		if (!parts.length || parts[0] === ")") {
			return new Complex(1);
		}

		if (parts[0] === "-") {
			parts.unshift("0");
		}

		const contents = Complex.eval__read_addition(parts);

		if (parts[0] === ")" || !parts.length) {
			parts.shift();

			return contents;
		} else {
			throw new Error(
				`Invalid expression: ${[contents, ...parts].join(" ")}`
			);
		}
	}

	static eval(num: Complex | Real): Complex {
		let str = String(num)
			.trim()
			.split("")
			.join("_")
			.toLowerCase()
			.replace(/ +/g, " ");

		do {
			var tmp = str.length;
			str = str.replace(/(\d+)_(\d+)/g, "$1$2"); // merge digits
		} while (tmp > str.length);

		const parts = str
			.replace(/(\d+)_[\,\.]_(\d+)/g, "$1.$2") // merge decimals
			.replace(/\*_\*/g, "^") // replace ** with ^
			.replace(/π/g, String(Math.PI))
			.replace(/p_i/g, String(Math.PI)) // replace pi with 3.141592653589793
			.replace(/[ij]/g, "j") // replace i with j
			.replace(/\-_\+/g, "-")
			.replace(/\+_\-/g, "-")
			.replace(/\+_\+/g, "+")
			.replace(/\-_\-/g, "+")
			.replace(/e_((x_p)|(\^))/g, "exp")
			.replace(/l_((o_g)|(n))/g, "ln")
			.split("_")
			.filter((a) => a);

		return Complex.eval__read_bracket_contents(parts);
	}
}

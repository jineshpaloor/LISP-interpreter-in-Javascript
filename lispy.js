
Math.add = function (a, b) {
    return a + b;
};

Math.sub = function (a, b) {
    return a - b;
};

Math.mul = function (a, b) {
    return a * b;
};

Math.div = function (a, b) {
    return a / b;
};

Math.gt = function (a, b) {
    return a > b;
};

Math.lt = function (a, b) {
    return a < b;
};

Math.ge = function (a, b) {
    return a >= b;
};

Math.le = function (a, b) {
    return a <= b;
};

Math.eq = function (a, b) {
    return a === b;
};

Math.mod = function (a, b) {
    return a % b;
};

var Symbol = String;

var environment = function (spec) {
    var i, env = {}, outer = spec.outer || {};
	
    var get_outer = function () {
		return outer;
    };
	
    var find = function (variable) {
		if (env.hasOwnProperty(variable)) {
			return env;
		} else {
            return outer.find(variable);
        }
    };
    
    if (0 !== spec.params.length) {
        for (i = 0; i < spec.params.length; i += 1) {
            env[spec.params[i]] = spec.args[i];
        }
    }

    env.get_outer = get_outer;
    env.find = find;
    
    return env;
};

var add_globals = function (env) {
    env['+'] = Math.add;
    env['-'] = Math.sub;
    env['*'] = Math.mul;
    env['/'] = Math.div;
    env['>'] = Math.gt;
    env['<'] = Math.lt;
    env['>='] = Math.ge;
    env['<='] = Math.le;
    env['='] = Math.eq;
	env['remainder'] = Math.mod;
    env['equal?'] = Math.eq;
    env['eq?'] = Math.eq; 
	env['length'] = function (x) { return x.length; };
	env['cons'] = function (x, y) { var arr = [x]; return arr.concat(y); };
    env['car'] = function (x) { return (x.length !== 0) ? x[0] : null; };
    env['cdr'] = function (x) { return (x.length > 1) ? x.slice(1) : null; }; 
	env['append'] = function (x, y) { return x.concat(y); };
    env['list'] = function () { return Array.prototype.slice.call(arguments); };
	env['list?'] = function (x) { return x && typeof x === 'object' && x.constructor === Array ; }; 
	env['null?'] = function (x) { return (!x || x.length === 0); };
	env['symbol?'] = function (x) { return typeof x === 'string'; };
    return env;
};

var global_env = add_globals(environment({params: [], args: [], outer: undefined}));

var eval = function (x, env) {
	env = env || global_env;
	return ((analyze(x)) (env));
};

var analyze = function (x) {
    if (typeof x === 'string') {	//variable reference
        return function (env) { return env.find(x.valueOf())[x.valueOf()];};
    } else if (typeof x === 'number') {	//constant literal
        return function (env) { return x; };
    } else if (x[0] === 'quote') {	//(quote exp)
		var qval = x[1];
        return function (env) { return  qval; };
    } else if (x[0] === 'if') {		//(if test conseq alt)
		return function (pproc, cproc, aproc) {
			return function (env) { 
						if (pproc(env)) {
							return cproc(env);
						} else {
							return aproc(env);
						}
					};		
		}(analyze(x[1]), analyze(x[2]), analyze(x[3]));
    } else if (x[0] === 'set!') {			//(set! var exp)
		return function (vvar, vproc) {
			return function (env) { env.find(vvar)[vvar] = vproc(env); };
		}(x[1], analyze(x[2]));
    } else if (x[0] === 'define') {	//(define var exp)
		return function (vvar, vproc) {
			return function (env) { env[vvar] = vproc(env); };
		}(x[1], analyze(x[2]));
    } else if (x[0] === 'lambda') {	//(lambda (var*) exp)
		return analyze_lambda(x);
    } else if (x[0] === 'begin') {	//(begin exp*)
		x.shift();
		return analyze_sequence(x);
    } else {				//(proc exp*)
		var aprocs = x.map(analyze);

		var fproc = aprocs.shift();	

		return function (env) {

			var opprocs = aprocs.map(function (aproc) {return aproc(env);});

			return fproc(env).apply(env, opprocs);
		};
    }
};

var analyze_lambda = function (x) {
	var vars = x[1];
	var bproc = analyze_sequence([x[2]]);
	return function (env) {
        return function () {
	        return bproc(environment({params: vars, args: arguments, outer: env }));
        };		
	};
};

var analyze_sequence = function (x) {
	var procs = x.map(analyze);
	return function (env) {
		var result;
		var i;
		for (i = 0; i < procs.length; i += 1) {
			result = procs[i](env);
		}
		return result;
	};
};


var atom = function (token) {
    if (isNaN(token)) {
		return token;
    } else {
		return +token; //Cast to number. Nice trick from Douglas Crockford's Javascript: The Good Parts
    }
};

function read(s){

	return read_from(tokenize(s));
}

function tokenize (s){

	return s.replace(/\)/g," ) ").replace(/\(/g," ( ").replace(/^\s+|\s+$/g, '').replace(/\s{2,}/g,' ').split(' ');
}

function read_from(tokens) {
    if (0 === tokens.length) {
		throw {
			name: 'SyntaxError',
			message: 'unexpected EOF while reading'
		};
	}
    var token = tokens.shift();
    if ('(' === token) {
		var L = [];
        while (')' !== tokens[0]) {
            L.push(read_from(tokens));
        }
        tokens.shift(); 
        return L;
    } else {
		if (')' === token) {
			throw {
				name: 'SyntaxError',
				message: 'unexpected )'
			};
		} else {
			return atom(token);
		}
    }
}

var parse = read;

var to_string = function (exp) {
};


function get_output(s){
	try{
		var b = eval;
		alert(b(parse(s)));
		list = eval(parse(s));
		alert(list);

	}catch(e){
		alert(e.name + e.message);
	}
}



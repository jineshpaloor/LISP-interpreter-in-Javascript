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


function add_globals(env){

	env['test'] = 'success';
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

	env['length'] = function (x) { return x.length };
	env['cons'] = function (x, y) { var arr = [x]; return arr.concat(y); };
    env['car'] = function (x) { return x[0] };
	env['cdr'] = function (x) { return x.slice(1) };
	env['append'] = function (x,y) { return x.concat(y); };
	env['list?'] = function (x) { return x && typeof x === 'object' && x.constructor === Array ; }; 
	env['null?'] = function (x) { return (!x || x.length === 0); };
	env['symbol?'] = function (x) { return typeof x === 'string'; };
	return env;
}


function Env(dict){
	var env = {}, i, outer = dict.outer || {};	
	for (i = 0; i < dict.params.length; i+=1)
		env[dict.params[i]] = dict.args[i];

	function find(variable){
		if (env.hasOwnProperty(variable)) {
			return env;
		} else {
            return outer.find(variable);
        }
	}
   env.outer = outer;
   env.find = find;
    
   return env;
}

var global_env = add_globals(Env({params:[], args:[], outer:undefined}));

//evaluate
function evaluate(x, env){
	env  = env || global_env;

	if( typeof x === 'string' ){
		return function(env){ return env.find(x)[x];};
	}
	else if( typeof x === 'number' ){
		return function(env) {return x;};
	}
	else if( x[0] === 'quote' ){
		return function(env){ return x.slice(1); };
	}
	else if( x[0] === 'if' ){	//(if test conseq alt)
		if(evaluate( x[1], env)){
			return evaluate( x[2], env );
		}
		else{
			return evaluate( x[3], env );
		}
	}
	else if( x[0] === 'set!' ){	//(set! var exp)
		return function(env){ return env[x[1]] = evaluate( x[2], env ); };
	}
	else if( x[0] === 'define' ){
		env[x[1]] = evaluate( x[2], env );
	}
	else if( x[0] === 'lambda' ){
		return eval_lambda( x, env );
	}
	else if( x[0] === 'begin' ){
		x = x.slice(1);
		for ( i in x){
			var val = evaluate( x[i], env );	
		}
		return val;
	}
	else {
		var exps = x.map(evaluate);
		var proc = exps.shift();

		return proc.apply(env, exps);
	}
	
}

function eval_lambda( x, env ){
	var vars = x[1];
	var bproc = eval_sequence([x[2]]);
	return function (env) {
        return function () {
	        return bproc(environment({params: vars, args: arguments, outer: env }));
        };		
	};

}

var eval_sequence = function (x) {
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

function  atom(token) {
    if (isNaN(token)) {
		return token;
    } else {
		return +token; 
    }
}

function get_output(s){
	try{
		list = evaluate(read(s));
		alert(list);

	}catch(e){
		alert(e.name + e.message);
	}
}



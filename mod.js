// Copyright Joyent, Inc. and other Node contributors.

var R = typeof Reflect === 'object' ? Reflect : null;
var ReflectApply = R && typeof R.apply === 'function'
  ? R.apply
  : function ReflectApply(target, receiver, args) {
    return Function.prototype.apply.call(target, receiver, args);
  };

var ReflectOwnKeys;
if (R && typeof R.ownKeys === 'function') {
  ReflectOwnKeys = R.ownKeys;
} else if (Object.getOwnPropertySymbols) {
  ReflectOwnKeys = function ReflectOwnKeys(target) {
    return Object.getOwnPropertyNames(target)
      .concat(Object.getOwnPropertySymbols(target));
  };
} else {
  ReflectOwnKeys = function ReflectOwnKeys(target) {
    return Object.getOwnPropertyNames(target);
  };
}

function ProcessEmitWarning(warning) {
  if (console && console.warn) console.warn(warning);
}

var NumberIsNaN = Number.isNaN || function NumberIsNaN(value) {
  return value !== value;
};

function EventEmitter() {
  EventEmitter.init.call(this);
}
var events = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._eventsCount = 0;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
var defaultMaxListeners = 10;

Object.defineProperty(EventEmitter, 'defaultMaxListeners', {
  enumerable: true,
  get: function() {
    return defaultMaxListeners;
  },
  set: function(arg) {
    if (typeof arg !== 'number' || arg < 0 || NumberIsNaN(arg)) {
      throw new RangeError('The value of "defaultMaxListeners" is out of range. It must be a non-negative number. Received ' + arg + '.');
    }
    defaultMaxListeners = arg;
  }
});

EventEmitter.init = function() {

  if (this._events === undefined ||
      this._events === Object.getPrototypeOf(this)._events) {
    this._events = Object.create(null);
    this._eventsCount = 0;
  }

  this._maxListeners = this._maxListeners || undefined;
};

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function setMaxListeners(n) {
  if (typeof n !== 'number' || n < 0 || NumberIsNaN(n)) {
    throw new RangeError('The value of "n" is out of range. It must be a non-negative number. Received ' + n + '.');
  }
  this._maxListeners = n;
  return this;
};

function $getMaxListeners(that) {
  if (that._maxListeners === undefined)
    return EventEmitter.defaultMaxListeners;
  return that._maxListeners;
}

EventEmitter.prototype.getMaxListeners = function getMaxListeners() {
  return $getMaxListeners(this);
};

EventEmitter.prototype.emit = function emit(type) {
  var args = [];
  for (var i = 1; i < arguments.length; i++) args.push(arguments[i]);
  var doError = (type === 'error');

  var events = this._events;
  if (events !== undefined)
    doError = (doError && events.error === undefined);
  else if (!doError)
    return false;

  // If there is no 'error' event listener then throw.
  if (doError) {
    var er;
    if (args.length > 0)
      er = args[0];
    if (er instanceof Error) {
      // Note: The comments on the `throw` lines are intentional, they show
      // up in Node's output if this results in an unhandled exception.
      throw er; // Unhandled 'error' event
    }
    // At least give some kind of context to the user
    var err = new Error('Unhandled error.' + (er ? ' (' + er.message + ')' : ''));
    err.context = er;
    throw err; // Unhandled 'error' event
  }

  var handler = events[type];

  if (handler === undefined)
    return false;

  if (typeof handler === 'function') {
    ReflectApply(handler, this, args);
  } else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      ReflectApply(listeners[i], this, args);
  }

  return true;
};

function _addListener(target, type, listener, prepend) {
  var m;
  var events;
  var existing;

  if (typeof listener !== 'function') {
    throw new TypeError('The "listener" argument must be of type Function. Received type ' + typeof listener);
  }

  events = target._events;
  if (events === undefined) {
    events = target._events = Object.create(null);
    target._eventsCount = 0;
  } else {
    // To avoid recursion in the case that type === "newListener"! Before
    // adding it to the listeners, first emit "newListener".
    if (events.newListener !== undefined) {
      target.emit('newListener', type,
                  listener.listener ? listener.listener : listener);

      // Re-assign `events` because a newListener handler could have caused the
      // this._events to be assigned to a new object
      events = target._events;
    }
    existing = events[type];
  }

  if (existing === undefined) {
    // Optimize the case of one listener. Don't need the extra array object.
    existing = events[type] = listener;
    ++target._eventsCount;
  } else {
    if (typeof existing === 'function') {
      // Adding the second element, need to change to array.
      existing = events[type] =
        prepend ? [listener, existing] : [existing, listener];
      // If we've already got an array, just append.
    } else if (prepend) {
      existing.unshift(listener);
    } else {
      existing.push(listener);
    }

    // Check for listener leak
    m = $getMaxListeners(target);
    if (m > 0 && existing.length > m && !existing.warned) {
      existing.warned = true;
      // No error code for this since it is a Warning
      // eslint-disable-next-line no-restricted-syntax
      var w = new Error('Possible EventEmitter memory leak detected. ' +
                          existing.length + ' ' + String(type) + ' listeners ' +
                          'added. Use emitter.setMaxListeners() to ' +
                          'increase limit');
      w.name = 'MaxListenersExceededWarning';
      w.emitter = target;
      w.type = type;
      w.count = existing.length;
      ProcessEmitWarning(w);
    }
  }

  return target;
}

EventEmitter.prototype.addListener = function addListener(type, listener) {
  return _addListener(this, type, listener, false);
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.prependListener =
    function prependListener(type, listener) {
      return _addListener(this, type, listener, true);
    };

function onceWrapper() {
  var args = [];
  for (var i = 0; i < arguments.length; i++) args.push(arguments[i]);
  if (!this.fired) {
    this.target.removeListener(this.type, this.wrapFn);
    this.fired = true;
    ReflectApply(this.listener, this.target, args);
  }
}

function _onceWrap(target, type, listener) {
  var state = { fired: false, wrapFn: undefined, target: target, type: type, listener: listener };
  var wrapped = onceWrapper.bind(state);
  wrapped.listener = listener;
  state.wrapFn = wrapped;
  return wrapped;
}

EventEmitter.prototype.once = function once(type, listener) {
  if (typeof listener !== 'function') {
    throw new TypeError('The "listener" argument must be of type Function. Received type ' + typeof listener);
  }
  this.on(type, _onceWrap(this, type, listener));
  return this;
};

EventEmitter.prototype.prependOnceListener =
    function prependOnceListener(type, listener) {
      if (typeof listener !== 'function') {
        throw new TypeError('The "listener" argument must be of type Function. Received type ' + typeof listener);
      }
      this.prependListener(type, _onceWrap(this, type, listener));
      return this;
    };

// Emits a 'removeListener' event if and only if the listener was removed.
EventEmitter.prototype.removeListener =
    function removeListener(type, listener) {
      var list, events, position, i, originalListener;

      if (typeof listener !== 'function') {
        throw new TypeError('The "listener" argument must be of type Function. Received type ' + typeof listener);
      }

      events = this._events;
      if (events === undefined)
        return this;

      list = events[type];
      if (list === undefined)
        return this;

      if (list === listener || list.listener === listener) {
        if (--this._eventsCount === 0)
          this._events = Object.create(null);
        else {
          delete events[type];
          if (events.removeListener)
            this.emit('removeListener', type, list.listener || listener);
        }
      } else if (typeof list !== 'function') {
        position = -1;

        for (i = list.length - 1; i >= 0; i--) {
          if (list[i] === listener || list[i].listener === listener) {
            originalListener = list[i].listener;
            position = i;
            break;
          }
        }

        if (position < 0)
          return this;

        if (position === 0)
          list.shift();
        else {
          spliceOne(list, position);
        }

        if (list.length === 1)
          events[type] = list[0];

        if (events.removeListener !== undefined)
          this.emit('removeListener', type, originalListener || listener);
      }

      return this;
    };

EventEmitter.prototype.off = EventEmitter.prototype.removeListener;

EventEmitter.prototype.removeAllListeners =
    function removeAllListeners(type) {
      var listeners, events, i;

      events = this._events;
      if (events === undefined)
        return this;

      // not listening for removeListener, no need to emit
      if (events.removeListener === undefined) {
        if (arguments.length === 0) {
          this._events = Object.create(null);
          this._eventsCount = 0;
        } else if (events[type] !== undefined) {
          if (--this._eventsCount === 0)
            this._events = Object.create(null);
          else
            delete events[type];
        }
        return this;
      }

      // emit removeListener for all listeners on all events
      if (arguments.length === 0) {
        var keys = Object.keys(events);
        var key;
        for (i = 0; i < keys.length; ++i) {
          key = keys[i];
          if (key === 'removeListener') continue;
          this.removeAllListeners(key);
        }
        this.removeAllListeners('removeListener');
        this._events = Object.create(null);
        this._eventsCount = 0;
        return this;
      }

      listeners = events[type];

      if (typeof listeners === 'function') {
        this.removeListener(type, listeners);
      } else if (listeners !== undefined) {
        // LIFO order
        for (i = listeners.length - 1; i >= 0; i--) {
          this.removeListener(type, listeners[i]);
        }
      }

      return this;
    };

function _listeners(target, type, unwrap) {
  var events = target._events;

  if (events === undefined)
    return [];

  var evlistener = events[type];
  if (evlistener === undefined)
    return [];

  if (typeof evlistener === 'function')
    return unwrap ? [evlistener.listener || evlistener] : [evlistener];

  return unwrap ?
    unwrapListeners(evlistener) : arrayClone(evlistener, evlistener.length);
}

EventEmitter.prototype.listeners = function listeners(type) {
  return _listeners(this, type, true);
};

EventEmitter.prototype.rawListeners = function rawListeners(type) {
  return _listeners(this, type, false);
};

EventEmitter.listenerCount = function(emitter, type) {
  if (typeof emitter.listenerCount === 'function') {
    return emitter.listenerCount(type);
  } else {
    return listenerCount.call(emitter, type);
  }
};

EventEmitter.prototype.listenerCount = listenerCount;
function listenerCount(type) {
  var events = this._events;

  if (events !== undefined) {
    var evlistener = events[type];

    if (typeof evlistener === 'function') {
      return 1;
    } else if (evlistener !== undefined) {
      return evlistener.length;
    }
  }

  return 0;
}

EventEmitter.prototype.eventNames = function eventNames() {
  return this._eventsCount > 0 ? ReflectOwnKeys(this._events) : [];
};

function arrayClone(arr, n) {
  var copy = new Array(n);
  for (var i = 0; i < n; ++i)
    copy[i] = arr[i];
  return copy;
}

function spliceOne(list, index) {
  for (; index + 1 < list.length; index++)
    list[index] = list[index + 1];
  list.pop();
}

function unwrapListeners(arr) {
  var ret = new Array(arr.length);
  for (var i = 0; i < ret.length; ++i) {
    ret[i] = arr[i].listener || arr[i];
  }
  return ret;
}
var events_1 = events.EventEmitter;

function toArr(any) {
	return any == null ? [] : Array.isArray(any) ? any : [any];
}

function toVal(out, key, val, opts) {
	var x, old=out[key], nxt=(
		!!~opts.string.indexOf(key) ? (val == null || val === true ? '' : String(val))
		: typeof val === 'boolean' ? val
		: !!~opts.boolean.indexOf(key) ? (val === 'false' ? false : val === 'true' || (out._.push((x = +val,x * 0 === 0) ? x : val),!!val))
		: (x = +val,x * 0 === 0) ? x : val
	);
	out[key] = old == null ? nxt : (Array.isArray(old) ? old.concat(nxt) : [old, nxt]);
}

var lib = function (args, opts) {
	args = args || [];
	opts = opts || {};

	var k, arr, arg, name, val, out={ _:[] };
	var i=0, j=0, idx=0, len=args.length;

	const alibi = opts.alias !== void 0;
	const strict = opts.unknown !== void 0;
	const defaults = opts.default !== void 0;

	opts.alias = opts.alias || {};
	opts.string = toArr(opts.string);
	opts.boolean = toArr(opts.boolean);

	if (alibi) {
		for (k in opts.alias) {
			arr = opts.alias[k] = toArr(opts.alias[k]);
			for (i=0; i < arr.length; i++) {
				(opts.alias[arr[i]] = arr.concat(k)).splice(i, 1);
			}
		}
	}

	opts.boolean.forEach(key => {
		opts.boolean = opts.boolean.concat(opts.alias[key] = opts.alias[key] || []);
	});

	opts.string.forEach(key => {
		opts.string = opts.string.concat(opts.alias[key] = opts.alias[key] || []);
	});

	if (defaults) {
		for (k in opts.default) {
			opts.alias[k] = opts.alias[k] || [];
			(opts[typeof opts.default[k]] || []).push(k);
		}
	}

	const keys = strict ? Object.keys(opts.alias) : [];

	for (i=0; i < len; i++) {
		arg = args[i];

		if (arg === '--') {
			out._ = out._.concat(args.slice(++i));
			break;
		}

		for (j=0; j < arg.length; j++) {
			if (arg.charCodeAt(j) !== 45) break; // "-"
		}

		if (j === 0) {
			out._.push(arg);
		} else if (arg.substring(j, j + 3) === 'no-') {
			name = arg.substring(j + 3);
			if (strict && !~keys.indexOf(name)) {
				return opts.unknown(arg);
			}
			out[name] = false;
		} else {
			for (idx=j+1; idx < arg.length; idx++) {
				if (arg.charCodeAt(idx) === 61) break; // "="
			}

			name = arg.substring(j, idx);
			val = arg.substring(++idx) || (i+1 === len || (''+args[i+1]).charCodeAt(0) === 45 || args[++i]);
			arr = (j === 2 ? [name] : name);

			for (idx=0; idx < arr.length; idx++) {
				name = arr[idx];
				if (strict && !~keys.indexOf(name)) return opts.unknown('-'.repeat(j) + name);
				toVal(out, name, (idx + 1 < arr.length) || val, opts);
			}
		}
	}

	if (defaults) {
		for (k in opts.default) {
			if (out[k] === void 0) {
				out[k] = opts.default[k];
			}
		}
	}

	if (alibi) {
		for (k in out) {
			arr = opts.alias[k] || [];
			while (arr.length > 0) {
				out[arr.shift()] = out[k];
			}
		}
	}

	return out;
};

const removeBrackets = (v) => v.replace(/[<[].+/, '').trim();
const findAllBrackets = (v) => {
    const ANGLED_BRACKET_RE_GLOBAL = /<([^>]+)>/g;
    const SQUARE_BRACKET_RE_GLOBAL = /\[([^\]]+)\]/g;
    const res = [];
    const parse = (match) => {
        let variadic = false;
        let value = match[1];
        if (value.startsWith('...')) {
            value = value.slice(3);
            variadic = true;
        }
        return {
            required: match[0].startsWith('<'),
            value,
            variadic
        };
    };
    let angledMatch;
    while ((angledMatch = ANGLED_BRACKET_RE_GLOBAL.exec(v))) {
        res.push(parse(angledMatch));
    }
    let squareMatch;
    while ((squareMatch = SQUARE_BRACKET_RE_GLOBAL.exec(v))) {
        res.push(parse(squareMatch));
    }
    return res;
};
const getMriOptions = (options) => {
    const result = { alias: {}, boolean: [] };
    for (const [index, option] of options.entries()) {
        // We do not set default values in mri options
        // Since its type (typeof) will be used to cast parsed arguments.
        // Which mean `--foo foo` will be parsed as `{foo: true}` if we have `{default:{foo: true}}`
        // Set alias
        if (option.names.length > 1) {
            result.alias[option.names[0]] = option.names.slice(1);
        }
        // Set boolean
        if (option.isBoolean) {
            if (option.negated) {
                // For negated option
                // We only set it to `boolean` type when there's no string-type option with the same name
                const hasStringTypeOption = options.some((o, i) => {
                    return (i !== index &&
                        o.names.some(name => option.names.includes(name)) &&
                        typeof o.required === 'boolean');
                });
                if (!hasStringTypeOption) {
                    result.boolean.push(option.names[0]);
                }
            }
            else {
                result.boolean.push(option.names[0]);
            }
        }
    }
    return result;
};
const findLongest = (arr) => {
    return arr.sort((a, b) => {
        return a.length > b.length ? -1 : 1;
    })[0];
};
const padRight = (str, length) => {
    return str.length >= length ? str : `${str}${' '.repeat(length - str.length)}`;
};
const camelcase = (input) => {
    return input.replace(/([a-z])-([a-z])/g, (_, p1, p2) => {
        return p1 + p2.toUpperCase();
    });
};
const setDotProp = (obj, keys, val) => {
    let i = 0;
    let length = keys.length;
    let t = obj;
    let x;
    for (; i < length; ++i) {
        x = t[keys[i]];
        t = t[keys[i]] =
            i === length - 1
                ? val
                : x != null
                    ? x
                    : !!~keys[i + 1].indexOf('.') || !(+keys[i + 1] > -1)
                        ? {}
                        : [];
    }
};
const setByType = (obj, transforms) => {
    for (const key of Object.keys(transforms)) {
        const transform = transforms[key];
        if (transform.shouldTransform) {
            obj[key] = Array.prototype.concat.call([], obj[key]);
            if (typeof transform.transformFunction === 'function') {
                obj[key] = obj[key].map(transform.transformFunction);
            }
        }
    }
};
const getFileName = (input) => {
    const m = /([^\\\/]+)$/.exec(input);
    return m ? m[1] : '';
};
const camelcaseOptionName = (name) => {
    // Camelcase the option name
    // Don't camelcase anything after the dot `.`
    return name
        .split('.')
        .map((v, i) => {
        return i === 0 ? camelcase(v) : v;
    })
        .join('.');
};
class CACError extends Error {
    constructor(message) {
        super(message);
        this.name = this.constructor.name;
        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, this.constructor);
        }
        else {
            this.stack = new Error(message).stack;
        }
    }
}

class Option {
    constructor(rawName, description, config) {
        this.rawName = rawName;
        this.description = description;
        this.config = Object.assign({}, config);
        // You may use cli.option('--env.* [value]', 'desc') to denote a dot-nested option
        rawName = rawName.replace(/\.\*/g, '');
        this.negated = false;
        this.names = removeBrackets(rawName)
            .split(',')
            .map((v) => {
            let name = v.trim().replace(/^-{1,2}/, '');
            if (name.startsWith('no-')) {
                this.negated = true;
                name = name.replace(/^no-/, '');
            }
            return camelcaseOptionName(name);
        })
            .sort((a, b) => (a.length > b.length ? 1 : -1)); // Sort names
        // Use the longest name (last one) as actual option name
        this.name = this.names[this.names.length - 1];
        if (this.negated) {
            this.config.default = true;
        }
        if (rawName.includes('<')) {
            this.required = true;
        }
        else if (rawName.includes('[')) {
            this.required = false;
        }
        else {
            // No arg needed, it's boolean flag
            this.isBoolean = true;
        }
    }
}

const deno = typeof window !== 'undefined' && window.Deno;
const processArgs = deno ? ['deno'].concat(Deno.args) : process.argv;
const platformInfo = deno
    ? `${Deno.build.os}-${Deno.build.arch} deno-${Deno.version.deno}`
    : `${process.platform}-${process.arch} node-${process.version}`;

class Command {
    constructor(rawName, description, config = {}, cli) {
        this.rawName = rawName;
        this.description = description;
        this.config = config;
        this.cli = cli;
        this.options = [];
        this.aliasNames = [];
        this.name = removeBrackets(rawName);
        this.args = findAllBrackets(rawName);
        this.examples = [];
    }
    usage(text) {
        this.usageText = text;
        return this;
    }
    allowUnknownOptions() {
        this.config.allowUnknownOptions = true;
        return this;
    }
    ignoreOptionDefaultValue() {
        this.config.ignoreOptionDefaultValue = true;
        return this;
    }
    version(version, customFlags = '-v, --version') {
        this.versionNumber = version;
        this.option(customFlags, 'Display version number');
        return this;
    }
    example(example) {
        this.examples.push(example);
        return this;
    }
    /**
     * Add a option for this command
     * @param rawName Raw option name(s)
     * @param description Option description
     * @param config Option config
     */
    option(rawName, description, config) {
        const option = new Option(rawName, description, config);
        this.options.push(option);
        return this;
    }
    alias(name) {
        this.aliasNames.push(name);
        return this;
    }
    action(callback) {
        this.commandAction = callback;
        return this;
    }
    /**
     * Check if a command name is matched by this command
     * @param name Command name
     */
    isMatched(name) {
        return this.name === name || this.aliasNames.includes(name);
    }
    get isDefaultCommand() {
        return this.name === '' || this.aliasNames.includes('!');
    }
    get isGlobalCommand() {
        return this instanceof GlobalCommand;
    }
    /**
     * Check if an option is registered in this command
     * @param name Option name
     */
    hasOption(name) {
        name = name.split('.')[0];
        return this.options.find(option => {
            return option.names.includes(name);
        });
    }
    outputHelp() {
        const { name, commands } = this.cli;
        const { versionNumber, options: globalOptions, helpCallback } = this.cli.globalCommand;
        const sections = [
            {
                body: `${name}${versionNumber ? ` v${versionNumber}` : ''}`
            }
        ];
        sections.push({
            title: 'Usage',
            body: `  $ ${name} ${this.usageText || this.rawName}`
        });
        const showCommands = (this.isGlobalCommand || this.isDefaultCommand) && commands.length > 0;
        if (showCommands) {
            const longestCommandName = findLongest(commands.map(command => command.rawName));
            sections.push({
                title: 'Commands',
                body: commands
                    .map(command => {
                    return `  ${padRight(command.rawName, longestCommandName.length)}  ${command.description}`;
                })
                    .join('\n')
            });
            sections.push({
                title: `For more info, run any command with the \`--help\` flag`,
                body: commands
                    .map(command => `  $ ${name}${command.name === '' ? '' : ` ${command.name}`} --help`)
                    .join('\n')
            });
        }
        const options = this.isGlobalCommand
            ? globalOptions
            : [...this.options, ...(globalOptions || [])];
        if (options.length > 0) {
            const longestOptionName = findLongest(options.map(option => option.rawName));
            sections.push({
                title: 'Options',
                body: options
                    .map(option => {
                    return `  ${padRight(option.rawName, longestOptionName.length)}  ${option.description} ${option.config.default === undefined
                        ? ''
                        : `(default: ${option.config.default})`}`;
                })
                    .join('\n')
            });
        }
        if (this.examples.length > 0) {
            sections.push({
                title: 'Examples',
                body: this.examples
                    .map(example => {
                    if (typeof example === 'function') {
                        return example(name);
                    }
                    return example;
                })
                    .join('\n')
            });
        }
        if (helpCallback) {
            helpCallback(sections);
        }
        console.log(sections
            .map(section => {
            return section.title
                ? `${section.title}:\n${section.body}`
                : section.body;
        })
            .join('\n\n'));
    }
    outputVersion() {
        const { name } = this.cli;
        const { versionNumber } = this.cli.globalCommand;
        if (versionNumber) {
            console.log(`${name}/${versionNumber} ${platformInfo}`);
        }
    }
    checkRequiredArgs() {
        const minimalArgsCount = this.args.filter(arg => arg.required).length;
        if (this.cli.args.length < minimalArgsCount) {
            throw new CACError(`missing required args for command \`${this.rawName}\``);
        }
    }
    /**
     * Check if the parsed options contain any unknown options
     *
     * Exit and output error when true
     */
    checkUnknownOptions() {
        const { options, globalCommand } = this.cli;
        if (!this.config.allowUnknownOptions) {
            for (const name of Object.keys(options)) {
                if (name !== '--' &&
                    !this.hasOption(name) &&
                    !globalCommand.hasOption(name)) {
                    throw new CACError(`Unknown option \`${name.length > 1 ? `--${name}` : `-${name}`}\``);
                }
            }
        }
    }
    /**
     * Check if the required string-type options exist
     */
    checkOptionValue() {
        const { options: parsedOptions, globalCommand } = this.cli;
        const options = [...globalCommand.options, ...this.options];
        for (const option of options) {
            const value = parsedOptions[option.name.split('.')[0]];
            // Check required option value
            if (option.required) {
                const hasNegated = options.some(o => o.negated && o.names.includes(option.name));
                if (value === true || (value === false && !hasNegated)) {
                    throw new CACError(`option \`${option.rawName}\` value is missing`);
                }
            }
        }
    }
}
class GlobalCommand extends Command {
    constructor(cli) {
        super('@@global@@', '', {}, cli);
    }
}

class CAC extends events_1 {
    /**
     * @param name The program name to display in help and version message
     */
    constructor(name = '') {
        super();
        this.name = name;
        this.commands = [];
        this.globalCommand = new GlobalCommand(this);
        this.globalCommand.usage('<command> [options]');
    }
    /**
     * Add a global usage text.
     *
     * This is not used by sub-commands.
     */
    usage(text) {
        this.globalCommand.usage(text);
        return this;
    }
    /**
     * Add a sub-command
     */
    command(rawName, description, config) {
        const command = new Command(rawName, description || '', config, this);
        command.globalCommand = this.globalCommand;
        this.commands.push(command);
        return command;
    }
    /**
     * Add a global CLI option.
     *
     * Which is also applied to sub-commands.
     */
    option(rawName, description, config) {
        this.globalCommand.option(rawName, description, config);
        return this;
    }
    /**
     * Show help message when `-h, --help` flags appear.
     *
     */
    help(callback) {
        this.globalCommand.option('-h, --help', 'Display this message');
        this.globalCommand.helpCallback = callback;
        this.showHelpOnExit = true;
        return this;
    }
    /**
     * Show version number when `-v, --version` flags appear.
     *
     */
    version(version, customFlags = '-v, --version') {
        this.globalCommand.version(version, customFlags);
        this.showVersionOnExit = true;
        return this;
    }
    /**
     * Add a global example.
     *
     * This example added here will not be used by sub-commands.
     */
    example(example) {
        this.globalCommand.example(example);
        return this;
    }
    /**
     * Output the corresponding help message
     * When a sub-command is matched, output the help message for the command
     * Otherwise output the global one.
     *
     */
    outputHelp() {
        if (this.matchedCommand) {
            this.matchedCommand.outputHelp();
        }
        else {
            this.globalCommand.outputHelp();
        }
    }
    /**
     * Output the version number.
     *
     */
    outputVersion() {
        this.globalCommand.outputVersion();
    }
    setParsedInfo({ args, options }, matchedCommand, matchedCommandName) {
        this.args = args;
        this.options = options;
        if (matchedCommand) {
            this.matchedCommand = matchedCommand;
        }
        if (matchedCommandName) {
            this.matchedCommandName = matchedCommandName;
        }
        return this;
    }
    /**
     * Parse argv
     */
    parse(argv = processArgs, { 
    /** Whether to run the action for matched command */
    run = true } = {}) {
        this.rawArgs = argv;
        if (!this.name) {
            this.name = argv[1] ? getFileName(argv[1]) : 'cli';
        }
        let shouldParse = true;
        // Search sub-commands
        for (const command of this.commands) {
            const parsed = this.mri(argv.slice(2), command);
            const commandName = parsed.args[0];
            if (command.isMatched(commandName)) {
                shouldParse = false;
                const parsedInfo = Object.assign({}, parsed, { args: parsed.args.slice(1) });
                this.setParsedInfo(parsedInfo, command, commandName);
                this.emit(`command:${commandName}`, command);
            }
        }
        if (shouldParse) {
            // Search the default command
            for (const command of this.commands) {
                if (command.name === '') {
                    shouldParse = false;
                    const parsed = this.mri(argv.slice(2), command);
                    this.setParsedInfo(parsed, command);
                    this.emit(`command:!`, command);
                }
            }
        }
        if (shouldParse) {
            const parsed = this.mri(argv.slice(2));
            this.setParsedInfo(parsed);
        }
        if (this.options.help && this.showHelpOnExit) {
            this.outputHelp();
            run = false;
        }
        if (this.options.version && this.showVersionOnExit) {
            this.outputVersion();
            run = false;
        }
        const parsedArgv = { args: this.args, options: this.options };
        if (run) {
            this.runMatchedCommand();
        }
        if (!this.matchedCommand && this.args[0]) {
            this.emit('command:*');
        }
        return parsedArgv;
    }
    mri(argv, 
    /** Matched command */ command) {
        // All added options
        const cliOptions = [
            ...this.globalCommand.options,
            ...(command ? command.options : [])
        ];
        const mriOptions = getMriOptions(cliOptions);
        // Extract everything after `--` since mri doesn't support it
        let argsAfterDoubleDashes = [];
        const doubleDashesIndex = argv.indexOf('--');
        if (doubleDashesIndex > -1) {
            argsAfterDoubleDashes = argv.slice(doubleDashesIndex + 1);
            argv = argv.slice(0, doubleDashesIndex);
        }
        let parsed = lib(argv, mriOptions);
        parsed = Object.keys(parsed).reduce((res, name) => {
            return Object.assign({}, res, { [camelcaseOptionName(name)]: parsed[name] });
        }, { _: [] });
        const args = parsed._;
        delete parsed._;
        const options = {
            '--': argsAfterDoubleDashes
        };
        // Set option default value
        const ignoreDefault = command && command.config.ignoreOptionDefaultValue
            ? command.config.ignoreOptionDefaultValue
            : this.globalCommand.config.ignoreOptionDefaultValue;
        let transforms = Object.create(null);
        for (const cliOption of cliOptions) {
            if (!ignoreDefault && cliOption.config.default !== undefined) {
                for (const name of cliOption.names) {
                    options[name] = cliOption.config.default;
                }
            }
            // If options type is defined
            if (Array.isArray(cliOption.config.type)) {
                if (transforms[cliOption.name] === undefined) {
                    transforms[cliOption.name] = Object.create(null);
                    transforms[cliOption.name]['shouldTransform'] = true;
                    transforms[cliOption.name]['transformFunction'] =
                        cliOption.config.type[0];
                }
            }
        }
        // Set dot nested option values
        for (const key of Object.keys(parsed)) {
            const keys = key.split('.');
            setDotProp(options, keys, parsed[key]);
            setByType(options, transforms);
        }
        return {
            args,
            options
        };
    }
    runMatchedCommand() {
        const { args, options, matchedCommand: command } = this;
        if (!command || !command.commandAction)
            return;
        command.checkUnknownOptions();
        command.checkOptionValue();
        command.checkRequiredArgs();
        const actionArgs = [];
        command.args.forEach((arg, index) => {
            if (arg.variadic) {
                actionArgs.push(args.slice(index));
            }
            else {
                actionArgs.push(args[index]);
            }
        });
        actionArgs.push(options);
        return command.commandAction.apply(this, actionArgs);
    }
}

/**
 * @param name The program name to display in help and version message
 */
const cac = (name = '') => new CAC(name);
if (typeof module !== 'undefined') {
    module.exports = cac;
    module.exports.default = cac;
    module.exports.cac = cac;
}

export default cac;
export { cac };

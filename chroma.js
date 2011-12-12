(function() {

  /**
      chroma.js - a neat JS lib for color conversions
      Copyright (C) 2011  Gregor Aisch
  
  	The JavaScript code in this page is free software: you can
      redistribute it and/or modify it under the terms of the GNU
      General Public License (GNU GPL) as published by the Free Software
      Foundation, either version 3 of the License, or (at your option)
      any later version.  The code is distributed WITHOUT ANY WARRANTY;
      without even the implied warranty of MERCHANTABILITY or FITNESS
      FOR A PARTICULAR PURPOSE.  See the GNU GPL for more details.
  
      As additional permission under GNU GPL version 3 section 7, you
      may distribute non-source (e.g., minimized or compacted) forms of
      that code without the copy of the GNU GPL normally required by
      section 4, provided you include this license notice and a URL
      through which recipients can access the Corresponding Source.  
      
      @source: https://github.com/gka/chroma.js
  */

  var CSSColors, Categories, Color, ColorScale, Diverging, Ramp, chroma, root, type, _ref, _ref2;
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  root = typeof exports !== "undefined" && exports !== null ? exports : this;

  chroma = (_ref = root.chroma) != null ? _ref : root.chroma = {};

  Color = (function() {

    /*
    	data type for colors
    	
    	eg.
    	new Color() // white
    	new Color(120,.8,.5) // defaults to hsl color
    	new Color([120,.8,.5]) // this also works
    	new Color(255,100,50,'rgb') //  color using RGB
    	new Color('#ff0000') // or hex value
    */

    function Color(x, y, z, m) {
      var me, _ref2;
      me = this;
      if (!(x != null) && !(y != null) && !(z != null) && !(m != null)) {
        x = [255, 0, 255];
      }
      if (type(x) === "array" && x.length === 3) {
        if (m == null) m = y;
        _ref2 = x, x = _ref2[0], y = _ref2[1], z = _ref2[2];
      }
      if (type(x) === "string") {
        m = 'hex';
      } else {
        if (m == null) m = 'rgb';
      }
      if (m === 'rgb') {
        me.rgb = [x, y, z];
      } else if (m === 'hsl') {
        me.rgb = Color.hsl2rgb(x, y, z);
      } else if (m === 'hsv') {
        me.rgb = Color.hsv2rgb(x, y, z);
      } else if (m === 'hex') {
        me.rgb = Color.hex2rgb(x);
      } else if (m === 'lab') {
        me.rgb = Color.lab2rgb(x, y, z);
      } else if (m === 'cls') {
        me.rgb = Color.cls2rgb(x, y, z);
      }
    }

    Color.prototype.hex = function() {
      return Color.rgb2hex(this.rgb);
    };

    Color.prototype.toString = function() {
      return this.hex();
    };

    Color.prototype.hsl = function() {
      return Color.rgb2hsl(this.rgb);
    };

    Color.prototype.hsv = function() {
      return Color.rgb2hsv(this.rgb);
    };

    Color.prototype.lab = function() {
      return Color.rgb2lab(this.rgb);
    };

    Color.prototype.interpolate = function(f, col, m) {
      /*
      		interpolates between colors
      */
      var dh, hue, hue0, hue1, lbv, lbv0, lbv1, me, sat, sat0, sat1, xyz0, xyz1;
      me = this;
      if (m == null) m = 'rgb';
      if (type(col) === "string") col = new Color(col);
      if (m === 'hsl' || m === 'hsv') {
        if (m === 'hsl') {
          xyz0 = me.hsl();
          xyz1 = col.hsl();
        } else if (m === 'hsv') {
          xyz0 = me.hsv();
          xyz1 = col.hsv();
        }
        hue0 = xyz0[0], sat0 = xyz0[1], lbv0 = xyz0[2];
        hue1 = xyz1[0], sat1 = xyz1[1], lbv1 = xyz1[2];
        if (!isNaN(hue0) && !isNaN(hue1)) {
          if (hue1 > hue0 && hue1 - hue0 > 180) {
            dh = hue1 - (hue0 + 360);
          } else if (hue1 < hue0 && hue0 - hue1 > 180) {
            dh = hue1 + 360 - hue0;
          } else {
            dh = hue1 - hue0;
          }
          hue = hue0 + f * dh;
        } else if (!isNaN(hue0)) {
          hue = hue0;
          if (lbv1 === 1 || lbv1 === 0) sat = sat0;
        } else if (!isNaN(hue1)) {
          hue = hue1;
          if (lbv0 === 1 || lbv0 === 0) sat = sat1;
        } else {
          hue = void 0;
        }
        if (sat == null) sat = sat0 + f * (sat1 - sat0);
        lbv = lbv0 + f * (lbv1 - lbv0);
        return new Color(hue, sat, lbv, m);
      } else if (m === 'rgb') {
        xyz0 = me.rgb;
        xyz1 = col.rgb;
        return new Color(xyz0[0] + f * (xyz1[0] - xyz0[0]), xyz0[1] + f * (xyz1[1] - xyz0[1]), xyz0[2] + f * (xyz1[2] - xyz0[2]), m);
      } else if (m === 'lab') {} else {
        throw "color mode " + m + " is not supported";
      }
    };

    return Color;

  })();

  Color.hex2rgb = function(hex) {
    var b, g, r, u;
    if (!hex.match(/^#?([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)) {
      throw new "wrong hex color format: " + hex;
    }
    if (hex.length === 4 || hex.length === 7) hex = hex.substr(1);
    if (hex.length === 3) {
      hex = hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
    }
    u = parseInt(hex, 16);
    r = u >> 16;
    g = u >> 8 & 0xFF;
    b = u & 0xFF;
    return [r, g, b];
  };

  Color.rgb2hex = function(r, g, b) {
    var str, u, _ref2;
    if (r !== void 0 && r.length === 3) {
      _ref2 = r, r = _ref2[0], g = _ref2[1], b = _ref2[2];
    }
    u = r << 16 | g << 8 | b;
    str = "000000" + u.toString(16).toUpperCase();
    return "#" + str.substr(str.length - 6);
  };

  Color.hsv2rgb = function(h, s, v) {
    var b, f, g, i, l, p, q, r, t, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8;
    if (type(h) === "array" && h.length === 3) {
      _ref2 = h, h = _ref2[0], s = _ref2[1], l = _ref2[2];
    }
    v *= 255;
    if (s === 0 && isNaN(h)) {
      r = g = b = v;
    } else {
      if (h === 360) h = 0;
      h /= 60;
      i = Math.floor(h);
      f = h - i;
      p = v * (1 - s);
      q = v * (1 - s * f);
      t = v * (1 - s * (1 - f));
      switch (i) {
        case 0:
          _ref3 = [v, t, p], r = _ref3[0], g = _ref3[1], b = _ref3[2];
          break;
        case 1:
          _ref4 = [q, v, p], r = _ref4[0], g = _ref4[1], b = _ref4[2];
          break;
        case 2:
          _ref5 = [p, v, t], r = _ref5[0], g = _ref5[1], b = _ref5[2];
          break;
        case 3:
          _ref6 = [p, q, v], r = _ref6[0], g = _ref6[1], b = _ref6[2];
          break;
        case 4:
          _ref7 = [t, p, v], r = _ref7[0], g = _ref7[1], b = _ref7[2];
          break;
        case 5:
          _ref8 = [v, p, q], r = _ref8[0], g = _ref8[1], b = _ref8[2];
      }
    }
    r = Math.round(r);
    g = Math.round(g);
    b = Math.round(b);
    return [r, g, b];
  };

  Color.rgb2hsv = function(r, g, b) {
    var delta, h, max, min, s, v, _ref2;
    if (r !== void 0 && r.length === 3) {
      _ref2 = r, r = _ref2[0], g = _ref2[1], b = _ref2[2];
    }
    min = Math.min(r, g, b);
    max = Math.max(r, g, b);
    delta = max - min;
    v = max / 255.0;
    s = delta / max;
    if (s === 0) {
      h = void 0;
      s = 0;
    } else {
      if (r === max) h = (g - b) / delta;
      if (g === max) h = 2 + (b - r) / delta;
      if (b === max) h = 4 + (r - g) / delta;
      h *= 60;
      if (h < 0) h += 360;
    }
    return [h, s, v];
  };

  Color.hsl2rgb = function(h, s, l) {
    var b, c, g, i, r, t1, t2, t3, _ref2, _ref3;
    if (h !== void 0 && h.length === 3) {
      _ref2 = h, h = _ref2[0], s = _ref2[1], l = _ref2[2];
    }
    if (s === 0) {
      r = g = b = l * 255;
    } else {
      t3 = [0, 0, 0];
      c = [0, 0, 0];
      t2 = l < 0.5 ? l * (1 + s) : l + s - l * s;
      t1 = 2 * l - t2;
      h /= 360;
      t3[0] = h + 1 / 3;
      t3[1] = h;
      t3[2] = h - 1 / 3;
      for (i = 0; i <= 2; i++) {
        if (t3[i] < 0) t3[i] += 1;
        if (t3[i] > 1) t3[i] -= 1;
        if (6 * t3[i] < 1) {
          c[i] = t1 + (t2 - t1) * 6 * t3[i];
        } else if (2 * t3[i] < 1) {
          c[i] = t2;
        } else if (3 * t3[i] < 2) {
          c[i] = t1 + (t2 - t1) * ((2 / 3) - t3[i]) * 6;
        } else {
          c[i] = t1;
        }
      }
      _ref3 = [Math.round(c[0] * 255), Math.round(c[1] * 255), Math.round(c[2] * 255)], r = _ref3[0], g = _ref3[1], b = _ref3[2];
    }
    return [r, g, b];
  };

  Color.rgb2hsl = function(r, g, b) {
    var h, l, max, min, s, _ref2;
    if (r !== void 0 && r.length === 3) {
      _ref2 = r, r = _ref2[0], g = _ref2[1], b = _ref2[2];
    }
    r /= 255;
    g /= 255;
    b /= 255;
    min = Math.min(r, g, b);
    max = Math.max(r, g, b);
    l = (max + min) / 2;
    if (max === min) {
      s = 0;
      h = void 0;
    } else {
      s = l < 0.5 ? (max - min) / (max + min) : (max - min) / (2 - max - min);
    }
    if (r === max) {
      h = (g - b) / (max - min);
    } else if (g === max) {
      h = 2 + (b - r) / (max - min);
    } else if (b === max) {
      h = 4 + (r - g) / (max - min);
    }
    h *= 60;
    if (h < 0) h += 360;
    return [h, s, l];
  };

  Color.lab2xyz = function(l, a, b) {
    /*
    	Convert from L*a*b* doubles to XYZ doubles
    	Formulas drawn from http://en.wikipedia.org/wiki/Lab_color_spaces
    */
    var finv, ill, sl, x, y, z, _ref2;
    if (type(l) === "array" && l.length === 3) {
      _ref2 = l, l = _ref2[0], a = _ref2[1], b = _ref2[2];
    }
    finv = function(t) {
      if (t > (6.0 / 29.0)) {
        return t * t * t;
      } else {
        return 3 * (6.0 / 29.0) * (6.0 / 29.0) * (t - 4.0 / 29.0);
      }
    };
    sl = (l + 0.16) / 1.16;
    ill = [0.96421, 1.00000, 0.82519];
    y = ill[1] * finv(sl);
    x = ill[0] * finv(sl + (a / 5.0));
    z = ill[2] * finv(sl - (b / 2.0));
    return [x, y, z];
  };

  Color.xyz2rgb = function(x, y, z) {
    /*
    	Convert from XYZ doubles to sRGB bytes
    	Formulas drawn from http://en.wikipedia.org/wiki/Srgb
    */
    var b, bl, clip, correct, g, gl, r, rl, _ref2, _ref3;
    if (type(x) === "array" && x.length === 3) {
      _ref2 = x, x = _ref2[0], y = _ref2[1], z = _ref2[2];
    }
    rl = 3.2406 * x - 1.5372 * y - 0.4986 * z;
    gl = -0.9689 * x + 1.8758 * y + 0.0415 * z;
    bl = 0.0557 * x - 0.2040 * y + 1.0570 * z;
    clip = Math.min(rl, gl, bl) < -0.001 || Math.max(rl, gl, bl) > 1.001;
    if (clip) {
      rl = rl < 0.0 ? 0.0 : rl > 1.0 ? 1.0 : rl;
      gl = gl < 0.0 ? 0.0 : gl > 1.0 ? 1.0 : gl;
      bl = bl < 0.0 ? 0.0 : bl > 1.0 ? 1.0 : bl;
    }
    if (clip) {
      _ref3 = [void 0, void 0, void 0], rl = _ref3[0], gl = _ref3[1], bl = _ref3[2];
    }
    correct = function(cl) {
      var a;
      a = 0.055;
      if (cl <= 0.0031308) {
        return 12.92 * cl;
      } else {
        return (1 + a) * Math.pow(cl, 1 / 2.4) - a;
      }
    };
    r = Math.round(255.0 * correct(rl));
    g = Math.round(255.0 * correct(gl));
    b = Math.round(255.0 * correct(bl));
    return [r, g, b];
  };

  Color.lab2rgb = function(l, a, b) {
    /*
    	Convert from LAB doubles to sRGB bytes 
    	(just composing the above transforms)
    */
    var x, y, z, _ref2, _ref3, _ref4;
    if (l !== void 0 && l.length === 3) {
      _ref2 = l, l = _ref2[0], a = _ref2[1], b = _ref2[2];
    }
    if (l !== void 0 && l.length === 3) {
      _ref3 = l, l = _ref3[0], a = _ref3[1], b = _ref3[2];
    }
    _ref4 = Color.lab2xyz(l, a, b), x = _ref4[0], y = _ref4[1], z = _ref4[2];
    return Color.xyz2rgb(x, y, z);
  };

  Color.cls2rgb = function(c, l, s) {
    var L, TAU, a, angle, b, r, _ref2;
    if (s == null) s = 1;
    /*
    	Convert from a qualitative parameter c and a quantitative parameter l to a 24-bit pixel. These formulas were invented by David Dalrymple to obtain maximum contrast without going out of gamut if the parameters are in the range 0-1.
    	
    	A saturation multiplier was added by Gregor Aisch
    */
    if (c !== void 0 && c.length === 3) {
      _ref2 = c, c = _ref2[0], l = _ref2[1], s = _ref2[2];
    }
    c /= 360.0;
    TAU = 6.283185307179586476925287;
    L = l * 0.61 + 0.09;
    angle = TAU / 6.0 - c * TAU;
    r = (l * 0.311 + 0.125) * s;
    a = Math.sin(angle) * r;
    b = Math.cos(angle) * r;
    return Color.lab2rgb(L, a, b);
  };

  Color.rgb2xyz = function(r, g, b) {
    var bl, correct, gl, rl, x, y, z, _ref2;
    if (r !== void 0 && r.length === 3) {
      _ref2 = r, r = _ref2[0], g = _ref2[1], b = _ref2[2];
    }
    correct = function(c) {
      var a;
      a = 0.055;
      if (c <= 0.04045) {
        return c / 12.92;
      } else {
        return Math.pow((c + a) / (1 + a), 2.4);
      }
    };
    rl = correct(r / 255.0);
    gl = correct(g / 255.0);
    bl = correct(b / 255.0);
    x = 0.4124 * rl + 0.3576 * gl + 0.1805 * bl;
    y = 0.2126 * rl + 0.7152 * gl + 0.0722 * bl;
    z = 0.0193 * rl + 0.1192 * gl + 0.9505 * bl;
    return [x, y, z];
  };

  Color.xyz2lab = function(x, y, z) {
    var a, b, f, ill, l, _ref2;
    if (x !== void 0 && x.length === 3) {
      _ref2 = x, x = _ref2[0], y = _ref2[1], z = _ref2[2];
    }
    ill = [0.96421, 1.00000, 0.82519];
    f = function(t) {
      if (t > Math.pow(6.0 / 29.0, 3)) {
        return Math.pow(t, 1 / 3);
      } else {
        return (1 / 3) * (29 / 6) * (29 / 6) * t + 4.0 / 29.0;
      }
    };
    l = 1.16 * f(y / ill[1]) - 0.16;
    a = 5 * (f(x / ill[0]) - f(y / ill[1]));
    b = 2 * (f(y / ill[1]) - f(z / ill[2]));
    return [l, a, b];
  };

  Color.rgb2lab = function(r, g, b) {
    var x, y, z, _ref2, _ref3;
    if (r !== void 0 && r.length === 3) {
      _ref2 = r, r = _ref2[0], g = _ref2[1], b = _ref2[2];
    }
    _ref3 = Color.rgb2xyz(r, g, b), x = _ref3[0], y = _ref3[1], z = _ref3[2];
    return Color.xyz2lab(x, y, z);
  };

  chroma.Color = Color;

  chroma.hsl = function(h, s, l) {
    return new Color(h, s, l, 'hsl');
  };

  chroma.hsv = function(h, s, v) {
    return new Color(h, s, v, 'hsv');
  };

  chroma.rgb = function(r, g, b) {
    return new Color(r, g, b, 'rgb');
  };

  chroma.hex = function(x) {
    return new Color(x);
  };

  chroma.lab = function(l, a, b) {
    return new Color(l, a, b, 'lab');
  };

  chroma.cls = function(c, l, s) {
    return new Color(c, l, s, 'cls');
  };

  ColorScale = (function() {

    /*
    	base class for color scales
    */

    function ColorScale(colors, positions, mode, nacol) {
      var c, me, _ref2;
      if (nacol == null) nacol = '#cccccc';
      me = this;
      for (c = 0, _ref2 = colors.length - 1; 0 <= _ref2 ? c <= _ref2 : c >= _ref2; 0 <= _ref2 ? c++ : c--) {
        if (typeof colors[c] === "string") colors[c] = new Color(colors[c]);
      }
      me.colors = colors;
      me.pos = positions;
      me.mode = mode;
      me.nacol = nacol;
      me;
    }

    ColorScale.prototype.getColor = function(value) {
      var col, f, f0, i, me, p, _ref2;
      me = this;
      if (isNaN(value)) return me.nacol;
      value = me.classifyValue(value);
      f = f0 = (value - me.min) / (me.max - me.min);
      f = Math.min(1, Math.max(0, f));
      for (i = 0, _ref2 = me.pos.length - 1; 0 <= _ref2 ? i <= _ref2 : i >= _ref2; 0 <= _ref2 ? i++ : i--) {
        p = me.pos[i];
        if (f <= p) {
          col = me.colors[i];
          break;
        }
        if (f >= p && i === me.pos.length - 1) {
          col = me.colors[i];
          break;
        }
        if (f > p && f < me.pos[i + 1]) {
          f = (f - p) / (me.pos[i + 1] - p);
          col = me.colors[i].interpolate(f, me.colors[i + 1], me.mode);
          break;
        }
      }
      return col;
    };

    ColorScale.prototype.setClasses = function(numClasses, method, limits) {
      var me;
      if (numClasses == null) numClasses = 5;
      if (method == null) method = 'equalinterval';
      if (limits == null) limits = [];
      /*
      		# use this if you want to display a limited number of data classes
      		# possible methods are "equalinterval", "quantiles", "custom"
      */
      me = this;
      me.classMethod = method;
      me.numClasses = numClasses;
      me.classLimits = limits;
      return me;
    };

    ColorScale.prototype.parseData = function(data, data_col) {
      var h, i, id, limits, max, method, min, num, p, pb, pr, row, self, sum, val, values, _ref2, _ref3;
      self = this;
      min = Number.MAX_VALUE;
      max = Number.MAX_VALUE * -1;
      sum = 0;
      values = [];
      for (id in data) {
        row = data[id];
        val = data_col != null ? row[data_col] : row;
        if (!self.validValue(val)) continue;
        min = Math.min(min, val);
        max = Math.max(max, val);
        values.push(val);
        sum += val;
      }
      values = values.sort();
      if (values.length % 2 === 1) {
        self.median = values[Math.floor(values.length * 0.5)];
      } else {
        h = values.length * 0.5;
        self.median = values[h - 1] * 0.5 + values[h] * 0.5;
      }
      self.values = values;
      self.mean = sum / values.length;
      self.min = min;
      self.max = max;
      method = self.classMethod;
      num = self.numClasses;
      limits = self.classLimits;
      if (method != null) {
        if (method === "equalinterval") {
          for (i = 1, _ref2 = num - 1; 1 <= _ref2 ? i <= _ref2 : i >= _ref2; 1 <= _ref2 ? i++ : i--) {
            limits.push(min + (i / num) * (max - min));
          }
        } else if (method === "quantiles") {
          for (i = 1, _ref3 = num - 1; 1 <= _ref3 ? i <= _ref3 : i >= _ref3; 1 <= _ref3 ? i++ : i--) {
            p = values.length * i / num;
            pb = Math.floor(p);
            if (pb === p) {
              limits.push(values[pb]);
            } else {
              pr = p - pb;
              limits.push(values[pb] * pr + values[pb + 1] * (1 - pr));
            }
          }
        }
        limits.unshift(min);
        limits.push(max);
      }
    };

    ColorScale.prototype.classifyValue = function(value) {
      var i, limits, maxc, minc, n, self;
      self = this;
      limits = self.classLimits;
      if (limits != null) {
        n = limits.length(-1);
        i = self.getClass(value);
        value = limits[i] + (limits[i + 1] - limits[i]) * 0.5;
        minc = limits[0] + (limits[1] - limits[0]) * 0.3;
        maxc = limits[n - 1] + (limits[n] - limits[n - 1]) * 0.7;
        value = self.min + ((value - minc) / (maxc - minc)) * (self.max - self.min);
      }
      return value;
    };

    ColorScale.prototype.getClass = function(value) {
      var i, limits, n, self;
      self = this;
      limits = self.classLimits;
      if (limits != null) {
        n = limits.length - 1;
        i = 0;
        while (i < n && value >= limits[i]) {
          i++;
        }
        return i - 1;
      }
    };

    ColorScale.prototype.validValue = function(value) {
      return !isNaN(value);
    };

    return ColorScale;

  })();

  Ramp = (function() {

    __extends(Ramp, ColorScale);

    function Ramp(col0, col1, mode) {
      if (col0 == null) col0 = '#fe0000';
      if (col1 == null) col1 = '#feeeee';
      if (mode == null) mode = 'hsl';
      Ramp.__super__.constructor.call(this, [col0, col1], [0, 1], mode);
    }

    return Ramp;

  })();

  chroma.Ramp = Ramp;

  Diverging = (function() {

    __extends(Diverging, ColorScale);

    function Diverging(col0, col1, col2, center, mode) {
      var me;
      if (col0 == null) col0 = '#d73027';
      if (col1 == null) col1 = '#ffffbf';
      if (col2 == null) col2 = '#1E6189';
      if (center == null) center = 'mean';
      if (mode == null) mode = 'hsl';
      me = this;
      me.mode = mode;
      me.center = center;
      Diverging.__super__.constructor.call(this, [col0, col1, col2], [0, .5, 1], mode);
    }

    Diverging.prototype.parseData = function(data, data_col) {
      var c, me;
      Diverging.__super__.parseData.call(this, data, data_col);
      me = this;
      c = me.center;
      if (c === 'median') {
        c = me.median;
      } else if (c === 'mean') {
        c = me.mean;
      }
      return me.pos[1] = (c - me.min) / (me.max - me.min);
    };

    return Diverging;

  })();

  chroma.Diverging = Diverging;

  Categories = (function() {

    __extends(Categories, ColorScale);

    function Categories(colors) {
      var me;
      me = this;
      me.colors = colors;
    }

    Categories.prototype.parseData = function(data, data_col) {};

    Categories.prototype.getColor = function(value) {
      var me;
      me = this;
      if (me.colors.hasOwnProperty(value)) {
        return me.colors[value];
      } else {
        return '#cccccc';
      }
    };

    Categories.prototype.validValue = function(value) {
      return this.colors.hasOwnProperty(value);
    };

    return Categories;

  })();

  chroma.Categories = Categories;

  CSSColors = (function() {

    __extends(CSSColors, ColorScale);

    function CSSColors(name) {
      var me;
      me = this;
      me.name = name;
      me.setClasses(7);
      me;
    }

    CSSColors.prototype.getColor = function(value) {
      var c, me;
      me = this;
      c = me.getClass(value);
      return me.name + ' l' + me.numClasses + ' c' + c;
    };

    return CSSColors;

  })();

  chroma.CSSColors = CSSColors;

  if ((_ref2 = chroma.scales) == null) chroma.scales = {};

  chroma.scales.cool = function() {
    return new Ramp(chroma.hsl(180, 1, .9), chroma.hsl(250, .7, .4));
  };

  chroma.scales.hot = function() {
    return new ColorScale(['#000000', '#ff0000', '#ffff00', '#ffffff'], [0, .25, .75, 1], 'rgb');
  };

  chroma.scales.BlWhOr = function() {
    return new Diverging(chroma.hsl(30, 1, .55), '#ffffff', new Color(220, 1, .55));
  };

  chroma.scales.GrWhPu = function() {
    return new Diverging(chroma.hsl(120, .8, .4), '#ffffff', new Color(280, .8, .4));
  };

  /*
  utils.coffee
  */

  type = (function() {
    /*
    	for browser-safe type checking+
    	ported from jQuery's $.type
    */
    var classToType, name, _i, _len, _ref3;
    classToType = {};
    _ref3 = "Boolean Number String Function Array Date RegExp Undefined Null".split(" ");
    for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
      name = _ref3[_i];
      classToType["[object " + name + "]"] = name.toLowerCase();
    }
    return function(obj) {
      var strType;
      strType = Object.prototype.toString.call(obj);
      return classToType[strType] || "object";
    };
  })();

  root = typeof exports !== "undefined" && exports !== null ? exports : this;

  root.type = type;

}).call(this);
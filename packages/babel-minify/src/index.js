// @flow
/*::import type {Plugin, Preset} from 'Babel';*/
import {transform} from 'babel-core';

// plugins
import manglePlugin                from 'babel-plugin-transform-mangle';
import evaluatePlugin              from 'babel-plugin-transform-evaluate';
import conditionalsPlugin          from 'babel-plugin-transform-conditionals';
import removeDebugger              from 'babel-plugin-transform-remove-debugger';
import removeConsole               from 'babel-plugin-transform-remove-console';
import deadCodeElimination         from 'babel-plugin-transform-dead-code-elimination';
import memberExpressionLiterals    from 'babel-plugin-transform-member-expression-literals';
import mergeSiblingVariables       from 'babel-plugin-transform-merge-sibling-variables';
import minifyBooleans              from 'babel-plugin-transform-minify-booleans';
import propertyLiterals            from 'babel-plugin-transform-property-literals';
import simplifyComparisonOperators from 'babel-plugin-transform-simplify-comparison-operators';
import undefinedToVoid             from 'babel-plugin-transform-undefined-to-void';
import functionToArrow             from 'babel-plugin-transform-function-to-arrow';
import globalDefsPlugin            from 'babel-plugin-transform-global-defs';

/**
 * The main function of the minifier
 */
export default function BabelMinify(inputCode /*:string*/, {
  mangle         = true,

  dead_code      = false,
  conditionals   = true,
  evaluate       = true, // eval constant expressions
  drop_debugger  = false,
  drop_console   = false,
  properties     = true,
  join_vars      = true,
  booleans       = true,
  unsafe         = true,
  keep_fnames    = false,

  // global-defs
  global_defs    = {},

  // number of passes
  passes         = 1,

  // passed on to babel transform to tell whether to use babelrc
  babelrc        = false,

  // should there be any other plugins added to this build process
  plugins        = [],

  // should there be any other presets
  presets        = [],

  // if false, babel-minify can give a list of plugins to use as a preset
  minify         = true,
} /*:MinifierOptions*/ = {}) /*:MinifierOutput*/ {

  if (typeof inputCode !== 'string' && minify) throw new Error('Invalid Input');

  /**
   * The final list of plugins that are applied in babel transform
   * This is the first list that's preffered in babel transform, the plugins
   * that go into this take one pass, plugins that prefer separate passes go into
   * the minifyPresets
   */
  let minifyPlugins /*:Plugin[]*/ = [];

  /**
   * The list of presets that are applied in SEPARATE passes
   */
  let minifyPresets /*:Preset[]*/ = [];

  evaluate      && minifyPlugins.push(evaluatePlugin);
  drop_debugger && minifyPlugins.push(removeDebugger);
  drop_console  && minifyPlugins.push(removeConsole);
  properties    && minifyPlugins.push(memberExpressionLiterals);
  properties    && minifyPlugins.push(propertyLiterals);
  join_vars     && minifyPlugins.push(mergeSiblingVariables);
  booleans      && minifyPlugins.push(minifyBooleans);
  unsafe        && minifyPlugins.push(undefinedToVoid);
  unsafe        && minifyPlugins.push(simplifyComparisonOperators);
  unsafe        && minifyPlugins.push([functionToArrow, { keep_fnames }]);

  if (Object.keys(global_defs).length > 0) {
    minifyPlugins.push([globalDefsPlugin, {
      global_defs
    }]);
  }

  /**
   * Append all user passed plugins to minifyPlugins
   */
  minifyPlugins = minifyPlugins.concat(plugins);

  /**
   * Things that remove code or replace code in a major way,
   * we just use then in separate presets to enable them to be
   * under separate passes
   */
  if (dead_code) {
    minifyPresets.push({plugins: [deadCodeElimination]});
  }
  if (conditionals) {
    minifyPresets.push({plugins: [conditionalsPlugin]});
  }

  /**
   * Append all user passed presets to passes
   */
  minifyPresets = [...minifyPresets, ...presets];

  /**
   * Keep mangler to be in the last of the presets
   * I don't know why clearly, but mangler seems to disrupt everything, so
   * I just keep it as the last pass
   */
  if (mangle) {
    let mangleOpts /*MangleOptions*/ = {};

    if (typeof mangle === 'boolean') {
      mangleOpts = {
        keep_fnames
      };
    } else if (typeof mangle === 'object') {
      /**
       * keep_fnames in mangle overrides global keep_fnames
       */
      mangleOpts = mangle;
    } else {
      throw new TypeError('Expected an object or boolean for mangle');
    }

    minifyPresets.push({
      plugins: [
        [manglePlugin, mangleOpts]
      ]
    });
  }

  // if minify is false, return the plugins list to be used elsewhere
  // maybe move this to a separate file later
  if (!minify) return { plugins: minifyPlugins, presets: minifyPresets };

  let result = {code: inputCode};

  while (passes-- > 0) {
    result = transform(result.code, {
      babelrc,
      comments: false,
      compact: true,
      minified: true,
      passPerPreset: true,
      presets: minifyPresets,
      plugins: minifyPlugins
    });
  }

  return result.code;
}

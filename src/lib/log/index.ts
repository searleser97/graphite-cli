type TLogOpts = {
  silent: boolean;
};
export function log(message: string, opts: TLogOpts = { silent: false }): void {
  if (!opts.silent) {
    console.log(message);
  }
}

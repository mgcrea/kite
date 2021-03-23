// Ensure this is treated as a module.
export {};

console.dir('setup');

declare global {
  var foo: string;
}

export default async () => {
  globalThis.foo = 'bar';
  console.warn('setup!');
};

import mkdirp = require('make-dir');
import { writeFile } from 'mz/fs';
import { dirname, join, relative } from 'path';
import iterateSources from '../../src/iterateSources';

export default async function copyFixturesInto(
  fixture: string,
  destination: string
): Promise<string> {
  const fixturePath = join('test/fixtures', fixture);

  for (const file of iterateSources([fixturePath], null, () => false)) {
    const relativePath = relative(fixturePath, file.path);
    const destinationPath = join(destination, relativePath);
    await mkdirp(dirname(destinationPath));
    await writeFile(destinationPath, file.content);
  }

  return destination;
}

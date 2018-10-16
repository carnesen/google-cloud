import { promisify } from 'util';
import { execFile } from 'child_process';
import { echo, logFactory } from './util';

export type UniversalProps = {
  name: string;
};

type InheritedProps = {
  projectId: string;
  zoneName: string;
};

export type Props<T> = UniversalProps & InheritedProps & T;

type ClassProps = {
  description: string;
};

type Asset<T> = Props<T> & {
  props: Props<T>;
};

// type Factory<T, U> = (props: Props<T>) => U;

export const assetFactory = (classProps: ClassProps) => (props: InheritedProps) => {
  const log = logFactory({ description, name });
  return {
    log,
  };
};

// <T>(props: Props<T>) => {};
assetFactory({
  description: 'some asset class',
  mapPropsToMembers: () => {},
})({ projectId: 'foo', zoneName: 'bar', name: 'foo' });

// Instantiate parent

// Use factory to instantiate child

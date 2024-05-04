/* eslint-disable import/no-webpack-loader-syntax */
import ReactSyntaxHighlighter from 'react-syntax-highlighter';
import Text from './text';
import demoText from '!!raw-loader!./text';
import Num from './number';
import demoNum from '!!raw-loader!./number';
import Hidden from './hidden';
import demoHidden from '!!raw-loader!./hidden';

const Examples: React.FC = () => (
  <>
    <h1 className="text-3xl font-bold">Examples</h1>
    <hr />

    <p className="my-4">
      Hopefully more examples will be added in the future.
    </p>

    <h2 className="text-2xl">React Hook Form</h2>
    <hr />
    <section className='p-2'>
      <h3 className="text-xl">Input type: text</h3>

      <div className="form-wrapper flex gap-2 flex-wrap w-full bg-slate-100">
        <div className="flex-grow">
          <ReactSyntaxHighlighter language='tsx'>
            {demoText}
          </ReactSyntaxHighlighter>
        </div>
        <div className="flex-grow">
          <Text />
        </div>
      </div>
    </section>

    <section className='p-2'>
      <h3 className="text-xl">Input type: number</h3>

      <div className="form-wrapper flex gap-2 flex-wrap w-full bg-slate-100">
        <div className="flex-grow">
          <ReactSyntaxHighlighter language='tsx'>
            {demoNum}
          </ReactSyntaxHighlighter>
        </div>
        <div className="flex-grow">
          <Num />
        </div>
      </div>
    </section>

    <section className='p-2'>
      <h3 className="text-xl">Input type: hidden</h3>

      <div className="form-wrapper flex gap-2 flex-wrap w-full bg-slate-100">
        <div className="flex-grow">
          <ReactSyntaxHighlighter language='tsx'>
            {demoHidden}
          </ReactSyntaxHighlighter>
        </div>
        <div className="flex-grow">
          <Hidden />
        </div>
      </div>
    </section>
  </>
);

export default Examples;

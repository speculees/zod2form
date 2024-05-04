const Welcome: React.FC = () => {
  return (
    <>
      <h1 className="text-3xl font-bold">z2f - Overview</h1>
      <hr />
      
      <p className="my-4">
        Zod2Form is an open source library that helps you to create a form from a zod schema.
      </p>

      <p className="my-4">
        By default, it is meant to be used with <a className="text-blue-500" target="_blank" rel="noreferrer" href="https://react-hook-form.com/">react-hook-form</a>.
        However, you can use it with any form library you prefer. It does not require any dependencies other than 
        &nbsp;<a className="text-blue-500" target="_blank" rel="noreferrer" href="https://github.com/colinhacks/zod">zod</a>.
        The aim of this library is to make it fully type-safe, testable, and easy to use.
      </p>

      <p className="my-4">
        The initial version of this project is a dependency of another personal project XYZ. Features that may
        be missing are probably not used in XYZ, so if you find any missing features, please let me know
        and I'll do my best to add them. 
      </p>

      <p className="my-4">
        For the time being, documentation and code examples will be a primary focus. So for now...
        <img className="my-4" src="/assets/doc-1.gif" alt="please excuse the crudity of this model" />
        Until then, feel free to explore the <a className="text-blue-500" target="_blank" rel="noreferrer" href="https://github.com/speculees/zod2form">Github</a> repository,
        and thank you for your interest in z2f!
        <img className="my-4" src="/assets/doc-2.gif" alt="See you in the future" />
      </p>
    </>
  );
}

export default Welcome;
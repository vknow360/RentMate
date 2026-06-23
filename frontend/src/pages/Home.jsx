const Home = () => {
  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl">
          Welcome to <span className="text-primary-600">RentMate</span>
        </h1>
        <p className="mt-4 text-xl text-gray-500">
          Find your perfect home and compatible roommates.
        </p>
      </div>
    </div>
  );
};

export default Home;

import { Button } from "@/components/ui/button";

export const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 py-24">
      <div>
        <p className="text-[8rem] font-bold text-gray-900">Error 404</p>
        <h1 className="text-4xl font-semibold text-gray-900 mb-4">
          Page not found
        </h1>
        <p className="text-lg text-muted-foreground max-w-md mx-auto">
          The page you've reached does not exist or is no longer available.
        </p>
        <div className="mt-6">
          <Button asChild size="lg">
            <a href="/">Head back to home</a>
          </Button>
        </div>
      </div>
    </div>
  );
};

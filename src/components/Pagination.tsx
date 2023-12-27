"use client";

import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
} from "lucide-react";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";

type Props = {
  page: number;
  lastPage: number;
};

export default function Pagination({ page, lastPage }: Props) {
  if (lastPage === 1) return null;

  return (
    <div className="flex items-center justify-end mt-8 space-x-2">
      <div className="space-x-2">
        <div className="flex items-center space-x-2">
          {page !== 1 && (
            <>
              <Button
                variant="outline"
                className="hidden w-8 h-8 p-0 lg:flex"
                asChild
              >
                <Link
                  to={{
                    search: `?page=${1}`,
                  }}
                >
                  <span className="sr-only">Go to first page</span>
                  <ChevronsLeftIcon className="w-4 h-4" />
                </Link>
              </Button>
              <Button variant="outline" className="w-8 h-8 p-0" asChild>
                <Link to={{ search: `?page=${page - 1}` }}>
                  <span className="sr-only">Go to previous page</span>
                  <ChevronLeftIcon className="w-4 h-4" />
                </Link>
              </Button>
            </>
          )}
          {Array.from({ length: lastPage }, (_, i) => i + 1).map((item) => (
            <Button
              variant={page === item ? "default" : "outline"}
              className="w-8 h-8 p-0"
              key={item}
              asChild
            >
              {item === page ? (
                <span>{page}</span>
              ) : (
                <Link
                  to={{
                    search: `?page=${item}`,
                  }}
                >
                  <span className="sr-only">Go to page {item}</span>
                  {item}
                </Link>
              )}
            </Button>
          ))}
          {page !== lastPage && lastPage > 1 && (
            <>
              <Button variant="outline" className="w-8 h-8 p-0" asChild>
                <Link
                  to={{
                    search: `?page=${page + 1}`,
                  }}
                >
                  <span className="sr-only">Go to next page</span>
                  <ChevronRightIcon className="w-4 h-4" />
                </Link>
              </Button>
              <Button
                variant="outline"
                className="hidden w-8 h-8 p-0 lg:flex"
                asChild
              >
                <Link
                  to={{
                    search: `?page=${lastPage}`,
                  }}
                >
                  <span className="sr-only">Go to last page</span>
                  <ChevronsRightIcon className="w-4 h-4" />
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

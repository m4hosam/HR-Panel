'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PlusCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { formatDate } from '@/lib/utils';

interface Employee {
  id: string;
  joinDate: Date;
  position: string;
  department: string;
  user: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
  };
}

interface EmployeeListProps {
  initialEmployees: Employee[];
  pagination: {
    total: number;
    pages: number;
    page: number;
    limit: number;
  };
  canCreate: boolean;
}

import { searchEmployees } from '@/lib/actions/search-employees';

export function EmployeeList({
  initialEmployees,
  pagination,
  canCreate,
}: EmployeeListProps) {
  const router = useRouter();
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [currentPagination, setCurrentPagination] = useState(pagination);
  const [page, setPage] = useState(pagination.page);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [isLoading, setIsLoading] = useState(false);
  
  // Update URL without causing a full page reload
  const updateURL = (params: Record<string, string>) => {
    const url = new URL(window.location.href);
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
    
    // Use replaceState to update URL without page reload
    window.history.replaceState({}, '', url);
  };
  
  // Fetch employees from server
  const fetchEmployees = async ({
    newPage = page,
    newSearch = search,
    newSortBy = sortBy,
    newSortDirection = sortDirection
  }) => {
    try {
      setIsLoading(true);
      
      const result = await searchEmployees({
        page: newPage,
        search: newSearch,
        sortBy: newSortBy,
        sortDirection: newSortDirection
      });
      
      if (result.error) {
        console.error(result.error);
        return;
      }
      
      setEmployees(result.employees ?? []);
      setCurrentPagination(result.pagination ?? {
        total: 0,
        pages: 1,
        page: 1,
        limit: 10
      });

      
      
      // Update URL parameters without page reload
      updateURL({
        page: newPage.toString(),
        search: newSearch,
        sortBy: newSortBy,
        sortDirection: newSortDirection
      });
      
    } catch (error) {
      console.error("Error fetching employees:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle search form submission
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1); // Reset to first page on new search
    await fetchEmployees({ newPage: 1, newSearch: search });
  };
  
  // Handle input change for real-time searching
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };
  
  // Handle page change
  const handlePageChange = async (newPage: number) => {
    setPage(newPage);
    await fetchEmployees({ newPage });
  };
  
  // Handle sort change
  const handleSortChange = async (column: string) => {
    const newDirection = sortBy === column && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortBy(column);
    setSortDirection(newDirection);
    await fetchEmployees({ newSortBy: column, newSortDirection: newDirection });
  };
  
  // Get initials for avatar fallback
  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Employees</h2>
        {canCreate && (
          <Button onClick={() => router.push('/dashboard/employees/new')}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Employee
          </Button>
        )}
      </div>
        <form onSubmit={handleSearch} className="flex space-x-2">
        <div className="relative max-w-sm">
          <Input
            placeholder="Search employees..."
            value={search}
            onChange={(e) => {
              handleSearchInputChange(e);
              // Auto-search after typing stops (debounce)
              clearTimeout((window as any).searchTimeout);
              (window as any).searchTimeout = setTimeout(() => {
                fetchEmployees({ newPage: 1, newSearch: e.target.value });
              }, 500);
            }}
            className="pr-8"
          />
          {isLoading && (
            <Loader2 className="h-4 w-4 animate-spin absolute right-3 top-1/2 transform -translate-y-1/2" />
          )}
        </div>
        <Select
          value={sortBy}
          onValueChange={(value) => {
            setSortBy(value);
            fetchEmployees({ newSortBy: value });
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="position">Position</SelectItem>
            <SelectItem value="department">Department</SelectItem>
            <SelectItem value="joinDate">Join Date</SelectItem>
          </SelectContent>
        </Select>        <Select
          value={sortDirection}
          onValueChange={(value) => {
            setSortDirection(value as 'asc' | 'desc');
            fetchEmployees({ newSortDirection: value as 'asc' | 'desc' });
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort direction" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="asc">Ascending</SelectItem>
            <SelectItem value="desc">Descending</SelectItem>
          </SelectContent>
        </Select>
        <Button type="submit">Search</Button>
      </form>
      
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Name</TableHead>
              <TableHead>Position</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Join Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  No employees found
                </TableCell>
              </TableRow>
            ) : (
              employees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center space-x-2">
                      <Avatar>
                        <AvatarImage src={employee.user.image || ''} alt={employee.user.name || ''} />
                        <AvatarFallback>{getInitials(employee.user.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div>{employee.user.name}</div>
                        <div className="text-xs text-muted-foreground">{employee.user.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{employee.position}</TableCell>
                  <TableCell>{employee.department}</TableCell>
                  <TableCell>{formatDate(employee.joinDate)}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      onClick={() => router.push(`/dashboard/employees/${employee.id}`)}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
        {currentPagination.pages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (page > 1) handlePageChange(page - 1);
                }}
              />
            </PaginationItem>
            
            {Array.from({ length: currentPagination.pages }, (_, i) => i + 1)
              .filter((p) => Math.abs(p - page) < 2 || p === 1 || p === currentPagination.pages)
              .map((p, i, arr) => {
                // Add ellipsis if needed
                if (i > 0 && arr[i - 1] !== p - 1) {
                  return (
                    <PaginationItem key={`ellipsis-${p}`}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  );
                }
                
                return (
                  <PaginationItem key={p}>
                    <PaginationLink
                      href="#"
                      isActive={page === p}
                      onClick={(e) => {
                        e.preventDefault();
                        handlePageChange(p);
                      }}
                    >
                      {p}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}
              <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (page < currentPagination.pages) handlePageChange(page + 1);
                }}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}

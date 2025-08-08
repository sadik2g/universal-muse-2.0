import { useQuery } from "@tanstack/react-query";

interface AuthData {
  user: {
    id: number;
    email: string;
    userType?: string;
  };
  model: {
    id: number;
    name: string;
    stageName?: string;
    profileImage?: string;
    bio?: string;
    location?: string;
    instagramHandle?: string;
    totalVotes: number;
    contestsWon: number;
    contestsJoined: number;
    currentRanking?: number;
    createdAt: string;
  };
}

// export function useAuth() {
//   const { data, isLoading, error } = useQuery<AuthData | null>({
//     queryKey: ["/api/auth/me"],
//     retry: false,
//     staleTime: 5 * 60 * 1000, // 5 minutes
//     refetchInterval: false,
//     refetchOnMount: true,
//     refetchOnWindowFocus: false,
//     queryFn: async () => {
//       const response = await fetch('/api/auth/me', {
//         credentials: 'include'
//       });
//       if (response.status === 401) {
//         return null; // Return null for unauthorized instead of throwing
//       }
//       if (!response.ok) {
//         throw new Error('Network error');
//       }
//       return response.json();
//     },
//   });

//   return {
//     user: data?.user || null,
//     model: data?.model || null,
//     isLoading,
//     isAuthenticated: !!(data && data.user),
//     error,
//   };
// }

export function useAuth() {
  const { data, isLoading, error } = useQuery<AuthData | null>({
    queryKey: ["/api/auth/me"],
    retry: false,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      const response = await fetch('/api/auth/me', {
        credentials: 'include'
      });
      if (response.status === 401) {
        return null;
      }
      if (!response.ok) {
        throw new Error('Network error');
      }
      return response.json();
    },
    placeholderData: null,
  });

  return {
    user: data?.user || null,
    model: data?.model || null,
    isLoading,
    isAuthenticated: !!data?.user,
    error,
  };
}

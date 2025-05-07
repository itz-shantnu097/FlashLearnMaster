import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, getQueryFn } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { type LearningDigest } from '@shared/schema';

export function useLatestDigest() {
  return useQuery<LearningDigest>({
    queryKey: ['/api/user/digest/latest'],
    queryFn: getQueryFn({ on401: 'throw' }),
    retry: false,
    refetchOnWindowFocus: false,
  });
}

export function useUserDigests() {
  return useQuery<LearningDigest[]>({
    queryKey: ['/api/user/digests'],
    queryFn: getQueryFn({ on401: 'throw' }),
    retry: false,
    refetchOnWindowFocus: false,
  });
}

export function useDigestByWeek(weekStart: string) {
  return useQuery<LearningDigest>({
    queryKey: ['/api/user/digest', weekStart],
    queryFn: getQueryFn({ on401: 'throw' }),
    retry: false,
    refetchOnWindowFocus: false,
    enabled: !!weekStart,
  });
}

export function useGenerateDigests() {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/admin/generate-digests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate digests');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Digests Generated',
        description: 'Weekly learning digests have been generated successfully.',
      });
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['/api/user/digests'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/digest/latest'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error Generating Digests',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}
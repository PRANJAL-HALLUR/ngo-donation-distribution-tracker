import { useState, useEffect } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Loader2, MapPin, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface LocationPermissionDialogProps {
  open: boolean;
  onGranted: () => void;
  onDenied: () => void;
  isLoading?: boolean;
  error?: string | null;
}

export function LocationPermissionDialog({
  open,
  onGranted,
  onDenied,
  isLoading = false,
  error = null,
}: LocationPermissionDialogProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    setIsProcessing(isLoading);
  }, [isLoading]);

  return (
    <AlertDialog open={open} onOpenChange={(newOpen) => {
      if (!isProcessing && !newOpen) {
        onDenied();
      }
    }}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-blue-600" />
            <AlertDialogTitle>Allow Location Access?</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="mt-3">
            FundHub needs your location to ensure transparency in donations and distributions. 
            Your real-time GPS coordinates will be stored with every transaction for complete traceability.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-900">
          <p className="font-semibold mb-1">Why we need this:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Track donation locations for transparency</li>
            <li>Record distribution points for accountability</li>
            <li>Verify activities on the platform</li>
          </ul>
        </div>

        <div className="flex gap-3 pt-4">
          <AlertDialogCancel
            onClick={onDenied}
            disabled={isProcessing}
            className="flex-1"
          >
            Deny
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onGranted}
            disabled={isProcessing}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enabling...
              </>
            ) : (
              'Allow Location'
            )}
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}

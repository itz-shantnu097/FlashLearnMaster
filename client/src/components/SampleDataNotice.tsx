import { AlertTriangle } from "lucide-react";

interface SampleDataNoticeProps {
  isVisible: boolean;
}

export default function SampleDataNotice({ isVisible }: SampleDataNoticeProps) {
  if (!isVisible) return null;

  return (
    <div className="w-full max-w-3xl mx-auto mb-4">
      <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-md">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <AlertTriangle className="h-5 w-5 text-amber-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-amber-800">
              Using Sample Content
            </h3>
            <div className="mt-2 text-sm text-amber-700">
              <p>
                We're currently showing sample content because we couldn't connect to the OpenAI API. 
                This could be due to your API key having reached its quota limit. For personalized educational 
                content, please check your OpenAI API key and try again later.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
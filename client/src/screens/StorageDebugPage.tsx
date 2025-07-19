import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import StorageConnectionStatus from '../components/StorageConnectionStatus';
import { 
  ArrowLeft, 
  Database, 
  Upload, 
  Download, 
  Trash2, 
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Settings,
  Info
} from 'lucide-react';
import { 
  testFirebaseStorageConnection, 
  testConnectionWithRetry,
  testFileUpload,
  getStorageInfo,
  ConnectionTestResult 
} from '../lib/connectionTest';
import { 
  uploadProfileImage, 
  uploadChatPhoto, 
  uploadTempPhoto,
  deleteFile,
  getStorageErrorMessage 
} from '../lib/storageUtils';
import { getUserId } from '../lib/userUtils';

const StorageDebugPage: React.FC = () => {
  const navigate = useNavigate();
  const [connectionResult, setConnectionResult] = useState<ConnectionTestResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<Array<{
    test: string;
    status: 'success' | 'error' | 'pending';
    message: string;
    timestamp: Date;
  }>>([]);
  const [storageInfo, setStorageInfo] = useState<any>(null);

  useEffect(() => {
    // Get storage configuration info
    setStorageInfo(getStorageInfo());
  }, []);

  const addTestResult = (test: string, status: 'success' | 'error' | 'pending', message: string) => {
    setTestResults(prev => [...prev, {
      test,
      status,
      message,
      timestamp: new Date()
    }]);
  };

  const clearResults = () => {
    setTestResults([]);
    setConnectionResult(null);
  };

  const runBasicConnectionTest = async () => {
    setIsLoading(true);
    addTestResult('Basic Connection', 'pending', 'Testing Firebase Storage connection...');
    
    try {
      const result = await testFirebaseStorageConnection();
      setConnectionResult(result);
      
      if (result.isConnected) {
        addTestResult('Basic Connection', 'success', result.message);
      } else {
        addTestResult('Basic Connection', 'error', result.message);
      }
    } catch (error: any) {
      addTestResult('Basic Connection', 'error', `Connection failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const runRetryConnectionTest = async () => {
    setIsLoading(true);
    addTestResult('Retry Connection', 'pending', 'Testing connection with retry logic...');
    
    try {
      const result = await testConnectionWithRetry(3);
      setConnectionResult(result);
      
      if (result.isConnected) {
        addTestResult('Retry Connection', 'success', `${result.message} (with retries)`);
      } else {
        addTestResult('Retry Connection', 'error', `${result.message} (failed after retries)`);
      }
    } catch (error: any) {
      addTestResult('Retry Connection', 'error', `Retry test failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testProfileImageUpload = async () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    
    fileInput.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      setIsLoading(true);
      addTestResult('Profile Upload', 'pending', `Uploading ${file.name}...`);
      
      try {
        const userId = getUserId();
        const result = await uploadProfileImage(file, userId, (progress) => {
          console.log(`Upload progress: ${progress}%`);
        });
        
        addTestResult('Profile Upload', 'success', `Successfully uploaded: ${result.url}`);
      } catch (error: any) {
        const errorMessage = getStorageErrorMessage(error);
        addTestResult('Profile Upload', 'error', `Upload failed: ${errorMessage}`);
      } finally {
        setIsLoading(false);
      }
    };
    
    fileInput.click();
  };

  const testChatPhotoUpload = async () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    
    fileInput.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      setIsLoading(true);
      addTestResult('Chat Photo Upload', 'pending', `Uploading ${file.name}...`);
      
      try {
        const userId = getUserId();
        const chatId = 'test-chat-' + Date.now();
        const result = await uploadChatPhoto(file, chatId, userId, (progress) => {
          console.log(`Upload progress: ${progress}%`);
        });
        
        addTestResult('Chat Photo Upload', 'success', `Successfully uploaded: ${result.url}`);
      } catch (error: any) {
        const errorMessage = getStorageErrorMessage(error);
        addTestResult('Chat Photo Upload', 'error', `Upload failed: ${errorMessage}`);
      } finally {
        setIsLoading(false);
      }
    };
    
    fileInput.click();
  };

  const testTempPhotoUpload = async () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    
    fileInput.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      setIsLoading(true);
      addTestResult('Temp Photo Upload', 'pending', `Uploading ${file.name}...`);
      
      try {
        const sessionId = 'test-session-' + Date.now();
        const result = await uploadTempPhoto(file, sessionId, (progress) => {
          console.log(`Upload progress: ${progress}%`);
        });
        
        addTestResult('Temp Photo Upload', 'success', `Successfully uploaded: ${result.url} (expires: ${result.expiresAt.toLocaleString()})`);
      } catch (error: any) {
        const errorMessage = getStorageErrorMessage(error);
        addTestResult('Temp Photo Upload', 'error', `Upload failed: ${errorMessage}`);
      } finally {
        setIsLoading(false);
      }
    };
    
    fileInput.click();
  };

  const getStatusIcon = (status: 'success' | 'error' | 'pending') => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
    }
  };

  const getStatusColor = (status: 'success' | 'error' | 'pending') => {
    switch (status) {
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'error':
        return 'border-red-200 bg-red-50';
      case 'pending':
        return 'border-blue-200 bg-blue-50';
    }
  };

  return (
    <>
      <Helmet>
        <title>AjnabiCam - Storage Debug</title>
      </Helmet>
      
      <main className="flex flex-col items-center min-h-screen w-full max-w-2xl mx-auto bg-gradient-to-br from-blue-50 via-indigo-25 to-purple-50 px-4 py-6 relative">
        {/* Header */}
        <div className="w-full flex items-center p-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xl rounded-t-2xl shadow-lg">
          <button 
            onClick={() => navigate(-1)} 
            className="mr-3 text-white font-bold text-xl hover:scale-110 transition-transform"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="flex-grow text-center">Storage Debug</h1>
          <Database className="h-6 w-6" />
        </div>

        <div className="w-full flex flex-col bg-white rounded-b-2xl border border-blue-100 shadow-xl mb-6 overflow-hidden">
          {/* Storage Connection Status */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Connection Status
            </h2>
            <StorageConnectionStatus showDetails={true} autoTest={true} />
          </div>

          {/* Storage Configuration */}
          {storageInfo && !storageInfo.error && (
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Info className="h-5 w-5" />
                Configuration
              </h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-1 gap-2 text-sm">
                  <div><strong>Storage Bucket:</strong> {storageInfo.bucket}</div>
                  <div><strong>Project ID:</strong> {storageInfo.projectId}</div>
                  <div><strong>Auth Domain:</strong> {storageInfo.authDomain}</div>
                  <div><strong>API Key:</strong> {storageInfo.apiKey}</div>
                </div>
              </div>
            </div>
          )}

          {/* Test Controls */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Connection Tests</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              <Button
                onClick={runBasicConnectionTest}
                disabled={isLoading}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                <Database className="h-4 w-4 mr-2" />
                Basic Test
              </Button>
              
              <Button
                onClick={runRetryConnectionTest}
                disabled={isLoading}
                className="bg-indigo-500 hover:bg-indigo-600 text-white"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry Test
              </Button>
            </div>
            
            <h3 className="text-md font-bold text-gray-800 mb-3">Upload Tests</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              <Button
                onClick={testProfileImageUpload}
                disabled={isLoading}
                variant="outline"
                className="border-green-300 text-green-700 hover:bg-green-50"
              >
                <Upload className="h-4 w-4 mr-2" />
                Profile Image
              </Button>
              
              <Button
                onClick={testChatPhotoUpload}
                disabled={isLoading}
                variant="outline"
                className="border-purple-300 text-purple-700 hover:bg-purple-50"
              >
                <Upload className="h-4 w-4 mr-2" />
                Chat Photo
              </Button>
              
              <Button
                onClick={testTempPhotoUpload}
                disabled={isLoading}
                variant="outline"
                className="border-orange-300 text-orange-700 hover:bg-orange-50"
              >
                <Upload className="h-4 w-4 mr-2" />
                Temp Photo
              </Button>
            </div>

            <Button
              onClick={clearResults}
              variant="outline"
              className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear Results
            </Button>
          </div>

          {/* Test Results */}
          <div className="p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Test Results</h2>
            
            {testResults.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Database className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No tests run yet. Click a test button above to get started.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {testResults.map((result, index) => (
                  <div
                    key={index}
                    className={`border rounded-lg p-4 ${getStatusColor(result.status)}`}
                  >
                    <div className="flex items-start gap-3">
                      {getStatusIcon(result.status)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-semibold text-gray-800">{result.test}</h4>
                          <span className="text-xs text-gray-500">
                            {result.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 break-words">{result.message}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Current Connection Result */}
          {connectionResult && (
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <h3 className="text-md font-bold text-gray-800 mb-3">Latest Connection Result</h3>
              <div className={`border rounded-lg p-4 ${
                connectionResult.isConnected ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  {connectionResult.isConnected ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  )}
                  <span className={`font-semibold ${
                    connectionResult.isConnected ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {connectionResult.isConnected ? 'Connected' : 'Connection Failed'}
                  </span>
                </div>
                <p className={`text-sm ${
                  connectionResult.isConnected ? 'text-green-700' : 'text-red-700'
                }`}>
                  {connectionResult.message}
                </p>
                
                {connectionResult.details && (
                  <div className="mt-3 grid grid-cols-3 gap-3 text-xs">
                    <div className="flex items-center gap-1">
                      {connectionResult.details.canWrite ? (
                        <CheckCircle className="h-3 w-3 text-green-500" />
                      ) : (
                        <AlertCircle className="h-3 w-3 text-red-500" />
                      )}
                      <span>Write</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {connectionResult.details.canRead ? (
                        <CheckCircle className="h-3 w-3 text-green-500" />
                      ) : (
                        <AlertCircle className="h-3 w-3 text-red-500" />
                      )}
                      <span>Read</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {connectionResult.details.canDelete ? (
                        <CheckCircle className="h-3 w-3 text-green-500" />
                      ) : (
                        <AlertCircle className="h-3 w-3 text-red-500" />
                      )}
                      <span>Delete</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Instructions */}
        <Card className="w-full bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-800 text-lg">How to Use</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-blue-700">
              <p>• <strong>Basic Test:</strong> Tests read, write, and delete operations</p>
              <p>• <strong>Retry Test:</strong> Same as basic but with retry logic</p>
              <p>• <strong>Upload Tests:</strong> Test actual file uploads to different paths</p>
              <p>• Check the connection status at the top for real-time info</p>
            </div>
          </CardContent>
        </Card>
      </main>
    </>
  );
};

export default StorageDebugPage;
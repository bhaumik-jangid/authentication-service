"use client";
import axios from "axios";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import toast, { Toaster } from "react-hot-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Copy } from "lucide-react";

export default function Dashboard() {
  interface App {
    appID: string;
    appName: string;
    redirectAfterLogin: string;
    createdAt: string;
  }

  const router = useRouter();
  const [apps, setApps] = useState<App[]>([]);
  const [loading, setLoading] = useState(true);
  const [newApp, setNewApp] = useState({
    appName: "",
    redirectAfterLogin: "/dashboard",
  });
  const [selectedAppIndex, setSelectedAppIndex] = useState<number | null>(null);
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showClientSecretDialog, setShowClientSecretDialog] = useState(false);
  const [clientSecret, setClientSecret] = useState("");

  const handleAddApp = async (appName: string, redirectAfterLogin: string) => {
    if (!appName.trim()) {
      toast.error("App Name is required!");
      return;
    }
    if (redirectAfterLogin === "") {
      toast.error("Redirect URL is required!");
      return;
    }
  
    const addApp = { appName, redirectAfterLogin };
  
    try {
        const response = await toast.promise(
            axios.post("/api/app/register", { appName, redirectAfterLogin }),
            {
              loading: "Adding app...",
              success: "App added successfully!",
            }
          );
    
          const secret = response.data.clientSecret;
          setClientSecret(secret);
          setShowAddDialog(false);
          fetchApps();
          setShowClientSecretDialog(true);
          setTimeout(() => {
            setShowClientSecretDialog(false);
            setClientSecret("");
          }, 60000);
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            if (error.response.status === 400) {
                toast.error(error.response.data.error)
                setNewApp({ appName: "", redirectAfterLogin: "/dashboard" });
                return;
            }
          } else {
            toast.error("An unexpected error occurred. Please try again later.");
          }
    }
  
    setNewApp({ appName: "", redirectAfterLogin: "/dashboard" });
  };

  const handleUpdateApp = async (appName: string, redirectAfterLogin: string) => {
    if (!appName.trim()) {
        toast.error("App Name is required!");
        return;
    }
    if (redirectAfterLogin === "") {
        toast.error("Redirect URL is required!");
        return;
    }

    const selectedApp = apps[selectedAppIndex!];

    try {
        const response = await toast.promise(
            axios.put(`/api/app/update`, {
                appID: selectedApp.appID,
                appName,
                redirectAfterLogin
            }),
            {
                loading: "Updating app...",
                success: "App updated successfully!",
            }
        );
        
        fetchApps();

    } catch (error) {
        console.error("Error updating app:", error);

        // Check if the error is from Axios and contains a response
        if (axios.isAxiosError(error) && error.response) {
            const errorMessage = error.response.data?.message || "An error occurred.";
            
            toast.error(errorMessage); // Display error message
            setNewApp({ appName: "", redirectAfterLogin: "/dashboard" });
            return;
        }

        toast.error("An unexpected error occurred. Please try again later.");
    }

    setNewApp({ appName: "", redirectAfterLogin: "/dashboard" });
    setShowUpdateDialog(false);
};

  
  const fetchApps = async () => {
    try {
      const response = await axios.get("/api/app/fetchApp");
      const sortedApps = (response.data.data || []).sort(
        (a: { createdAt: string }, b: { createdAt: string }) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  
      setApps(sortedApps);
    } catch (err) {
      console.error("Error fetching apps:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteApp = async (appID: string) => {
    await toast.promise(
      axios.post(`/api/app/delete`, { appID }),
      {
        loading: "Deleting app...",
        success: "App deleted successfully!",
        error: "Error deleting app. Please try again later.",
      }
    );
    router.push("/dashboard");
  
    fetchApps();
  };
  
  useEffect(() => {
    fetchApps();
  }, []);
  

  return (
    <div className="flex flex-col gap-10 px-[10%] pt-24 h-screen dark:bg-gray-900">
      <Toaster />

      <div className="flex flex-col gap-10">
        {/* New App Button */}
        <div className="flex gap-10">
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button variant="secondary">New App</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add App</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="appName" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="appName"
                    value={newApp.appName}
                    onChange={(e) =>
                      setNewApp({ ...newApp, appName: e.target.value })
                    }
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="redirectAfterLogin" className="text-right">
                    After Login
                  </Label>
                  <Input
                    id="redirectAfterLogin"
                    value={newApp.redirectAfterLogin}
                    onChange={(e) =>
                      setNewApp({ ...newApp, redirectAfterLogin: e.target.value })
                    }
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="submit"
                  onClick={() =>
                    handleAddApp(newApp.appName, newApp.redirectAfterLogin)
                  }
                >
                  Add
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

        {/* ClientSecret dialgue */}
          <Dialog open={showClientSecretDialog} onOpenChange={setShowClientSecretDialog}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Client Secret</DialogTitle>
                <DialogDescription>
                  This is your secret. Copy and store it securely, as it is required to connect your app with our service after user login.
                </DialogDescription>
              </DialogHeader>
              <div className="flex items-center space-x-2">
                <div className="grid flex-1 gap-2">
                  <Label htmlFor="clientSecret" className="sr-only">Client Secret</Label>
                  <Input id="clientSecret" value={clientSecret} readOnly />
                </div>
                <Button
                  type="button"
                  size="sm"
                  className="px-3"
                  onClick={() => {
                    navigator.clipboard.writeText(clientSecret);
                    toast.success("Client Secret copied successfully!");
                  }}
                >
                  <span className="sr-only">Copy</span>
                  <Copy />
                </Button>
              </div>
              <DialogFooter className="sm:justify-start">
                <DialogClose asChild>
                  <Button type="button" variant="secondary">Close</Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button >
            <Link href="/profile">Profile</Link>
          </Button>
        </div>

        {/* App Details Table */}
        <div className="rounded-sm border border-stroke px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:py-1 mb-[5%]">
          <h4 className="mb-6 text-xl font-semibold">App Details</h4>
          <div className="rounded-sm border border-stroke px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-">
            {loading ? (
              <p>Loading...</p>
            ) : apps.length === 0 ? (
              <p>No Details</p>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-2 dark:bg-meta-4">
                    <th className="p-2.5 text-sm font-medium uppercase xsm:text-base xl:p-5 text-center">
                      App ID
                    </th>
                    <th className="p-2.5 text-sm font-medium uppercase xsm:text-base xl:p-5 text-center">
                      App Name
                    </th>
                    <th className="hidden p-2.5 text-sm font-medium uppercase xsm:text-base xl:p-5 text-center sm:table-cell">
                      Login Redirects
                    </th>
                    <th className="hidden p-2.5 text-sm font-medium uppercase xsm:text-base xl:p-5 text-center sm:table-cell">
                      Created At
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {apps.map((app, index) => (
                    <tr
                      key={index}
                      className="border-b border-stroke dark:border-strokedark hover:bg-gray-200 dark:hover:bg-gray-800"   
                    >
                      <td className="p-2.5 xl:p-5 text-center">
                        <p className="">{app.appID}</p>
                      </td>
                      <td className="p-2.5 text-center xl:p-5">
                        <p className="">{app.appName}</p>
                      </td>
                      <td className="hidden p-2.5 text-center sm:table-cell xl:p-5">
                        <p className="">{app.redirectAfterLogin}</p>
                      </td>
                      <td className="hidden p-2.5 text-center sm:table-cell xl:p-5">
                        <p className="text-meta-5">
                          {format(
                            toZonedTime(new Date(app.createdAt), "Asia/Kolkata"),
                            "MMM dd, yyyy, h:mm a"
                          )}
                        </p>
                      </td>
                      {/* Add a column for the three-dot menu */}
                      <td className="p-2.5 xl:p-5 text-center relative">
                        <DropdownMenu>
                          <DropdownMenuTrigger 
                              onSelect={() => {
                                setSelectedAppIndex(index);
                              }}>                    
                              &#x22EE; {/* Vertical Ellipsis */}
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                  onSelect={() => {
                                      setSelectedAppIndex(index);
                                      setNewApp({
                                      appName: app.appName,
                                      redirectAfterLogin: app.redirectAfterLogin,
                                      });
                                      setTimeout(() => setShowUpdateDialog(true), 0); // Open dialog after state update
                                  }}
                                  >
                                  Update
                              </DropdownMenuItem>
                            <DropdownMenuItem
                              onSelect={() => handleDeleteApp(app.appID)}
                            >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Update App Dialog */}
        <Dialog open={showUpdateDialog} onOpenChange={setShowUpdateDialog}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Update App</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="appName" className="text-right">
                  Name
                </Label>
                <Input
                  id="appName"
                  value={newApp.appName}
                  onChange={(e) =>
                    setNewApp({ ...newApp, appName: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="redirectAfterLogin" className="text-right">
                  After Login
                </Label>
                <Input
                  id="redirectAfterLogin"
                  value={newApp.redirectAfterLogin}
                  onChange={(e) =>
                    setNewApp({ ...newApp, redirectAfterLogin: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="submit"
                onClick={() =>
                  handleUpdateApp(newApp.appName, newApp.redirectAfterLogin)
                }
              >
                Update
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

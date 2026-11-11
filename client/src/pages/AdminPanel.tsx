import { Button } from '@/components/ui/button';
import BrandLogo from '@/components/BrandLogo';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';
import { useState } from 'react';
import { toast } from 'sonner';

export default function AdminPanel() {
  const { user, loading } = useAuth();
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [chatMessage, setChatMessage] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [selectedRejectId, setSelectedRejectId] = useState<number | null>(null);

  const registrations = trpc.admin.getAllRegistrations.useQuery();
  const approveUser = trpc.admin.approveRegistration.useMutation();
  const rejectUser = trpc.admin.rejectRegistration.useMutation();
  const deleteUser = trpc.admin.deleteRegistration.useMutation();
  const sendMessage = trpc.chat.sendMessage.useMutation();
  const getMessages = trpc.chat.getMessages.useQuery({ userId: selectedUserId || 0 }, { enabled: !!selectedUserId });
  const notifications = trpc.notifications.getAdminNotifications.useQuery();

  if (loading) return <div>Loading...</div>;

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 max-w-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-slate-600">You do not have permission to access the admin panel.</p>
        </Card>
      </div>
    );
  }

  const handleApprove = async (registrationId: number) => {
    try {
      await approveUser.mutateAsync({ registrationId });
      toast.success('User approved successfully');
      registrations.refetch();
    } catch (error) {
      toast.error('Failed to approve user');
    }
  };

  const handleReject = async (registrationId: number) => {
    if (!rejectReason) {
      toast.error('Please provide a rejection reason');
      return;
    }
    try {
      await rejectUser.mutateAsync({ registrationId, reason: rejectReason });
      toast.success('User rejected');
      setSelectedRejectId(null);
      setRejectReason('');
      registrations.refetch();
    } catch (error) {
      toast.error('Failed to reject user');
    }
  };

  const handleDelete = async (registrationId: number) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteUser.mutateAsync({ registrationId });
        toast.success('User deleted');
        registrations.refetch();
      } catch (error) {
        toast.error('Failed to delete user');
      }
    }
  };

  const handleSendMessage = async () => {
    if (!chatMessage || !selectedUserId) return;
    try {
      await sendMessage.mutateAsync({ userId: selectedUserId, message: chatMessage });
      setChatMessage('');
      getMessages.refetch();
      toast.success('Message sent');
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-3"><BrandLogo size="md" /></div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Admin Panel</h1>
          <p className="text-slate-600">Manage users, approvals, and communications</p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="users">Users ({registrations.data?.length || 0})</TabsTrigger>
            <TabsTrigger value="chat">Live Chat</TabsTrigger>
            <TabsTrigger value="notifications">Notifications ({notifications.data?.length || 0})</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-4">
            {registrations.isLoading ? (
              <Card className="p-8 text-center">Loading users...</Card>
            ) : registrations.data?.length === 0 ? (
              <Card className="p-8 text-center text-slate-600">No registrations yet</Card>
            ) : (
              <div className="space-y-4">
                {registrations.data?.map((reg) => (
                  <Card key={reg.id} className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-slate-600">Name</p>
                        <p className="font-semibold text-slate-900">
                          {reg.firstName} {reg.lastName}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-600">Username</p>
                        <p className="font-semibold text-slate-900">{reg.username}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-600">Contact</p>
                        <p className="font-semibold text-slate-900">
                          {reg.contactMethod === 'email' ? reg.email : reg.phone}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-600">Status</p>
                        <p className={`font-semibold ${
                          reg.status && reg.status === 'approved' ? 'text-green-600' :
                          reg.status && reg.status === 'rejected' ? 'text-red-600' :
                          reg.status && reg.status === 'verified' ? 'text-blue-600' :
                          'text-yellow-600'
                        }`}>
                          {reg.status ? reg.status.charAt(0).toUpperCase() + reg.status.slice(1) : 'Pending'}
                        </p>
                      </div>
                    </div>

                    {reg.status === 'verified' && (
                      <div className="flex gap-2 flex-wrap">
                        <Button
                          size="sm"
                          onClick={() => handleApprove(reg.id)}
                          disabled={approveUser.isPending}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedRejectId(reg.id)}
                        >
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedUserId(reg.id)}
                          className="text-blue-600"
                        >
                          Chat
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(reg.id)}
                          disabled={deleteUser.isPending}
                        >
                          Delete
                        </Button>
                      </div>
                    )}

                    {selectedRejectId === reg.id && (
                      <div className="mt-4 p-4 bg-slate-100 rounded-lg space-y-3">
                        <Label htmlFor={`reason-${reg.id}`}>Rejection Reason</Label>
                        <Input
                          id={`reason-${reg.id}`}
                          placeholder="Enter reason for rejection..."
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleReject(reg.id)}
                            disabled={rejectUser.isPending}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Confirm Rejection
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedRejectId(null)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Chat Tab */}
          <TabsContent value="chat" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* User List */}
              <Card className="p-4">
                <h3 className="font-semibold mb-4">Active Conversations</h3>
                <div className="space-y-2">
                  {registrations.data?.map((reg) => (
                    <button
                      key={reg.id}
                      onClick={() => setSelectedUserId(reg.id)}
                      className={`w-full text-left p-3 rounded-lg transition ${
                        selectedUserId === reg.id
                          ? 'bg-blue-100 border-2 border-blue-600'
                          : 'bg-slate-100 hover:bg-slate-200'
                      }`}
                    >
                      <p className="font-semibold text-sm">{reg.firstName} {reg.lastName}</p>
                      <p className="text-xs text-slate-600">{reg.username}</p>
                    </button>
                  ))}
                </div>
              </Card>

              {/* Chat Window */}
              <div className="md:col-span-2">
                {selectedUserId ? (
                  <Card className="p-4 h-96 flex flex-col">
                    <div className="flex-1 overflow-y-auto mb-4 space-y-3 bg-slate-50 p-3 rounded">
                      {getMessages.data?.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex ${msg.senderType === 'admin' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-xs p-3 rounded-lg ${
                              msg.senderType === 'admin'
                                ? 'bg-blue-600 text-white'
                                : 'bg-slate-200 text-slate-900'
                            }`}
                          >
                            <p className="text-sm">{msg.message}</p>
                            <p className="text-xs opacity-70 mt-1">
                              {new Date(msg.createdAt).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Type a message..."
                        value={chatMessage}
                        onChange={(e) => setChatMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={sendMessage.isPending}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Send
                      </Button>
                    </div>
                  </Card>
                ) : (
                  <Card className="p-8 text-center text-slate-600">
                    Select a user to start chatting
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-4">
            {notifications.isLoading ? (
              <Card className="p-8 text-center">Loading notifications...</Card>
            ) : notifications.data?.length === 0 ? (
              <Card className="p-8 text-center text-slate-600">No notifications</Card>
            ) : (
              <div className="space-y-3">
                {notifications.data?.map((notif) => (
                  <Card key={notif.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-slate-900">{notif.title}</p>
                        <p className="text-sm text-slate-600">{notif.message}</p>
                        <p className="text-xs text-slate-500 mt-1">
                          {new Date(notif.createdAt).toLocaleString()}
                        </p>
                      </div>
                      {!notif.isRead && (
                        <span className="inline-block w-3 h-3 bg-blue-600 rounded-full"></span>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Admin Settings</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="signup-link">Main Sign-up Link</Label>
                  <Input
                    id="signup-link"
                    value={`${window.location.origin}/register`}
                    readOnly
                    className="bg-slate-100"
                  />
                  <Button size="sm" className="mt-2 bg-blue-600 hover:bg-blue-700">
                    Copy Link
                  </Button>
                </div>
                <div>
                  <Label>Notification Preferences</Label>
                  <div className="mt-2 space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" defaultChecked className="w-4 h-4" />
                      <span className="text-sm">Notify on new registrations</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" defaultChecked className="w-4 h-4" />
                      <span className="text-sm">Notify on pending approvals</span>
                    </label>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

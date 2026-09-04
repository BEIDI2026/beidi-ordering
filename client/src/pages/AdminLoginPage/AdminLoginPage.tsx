import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Lock, LogIn } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@client/src/components/ui/card';
import { Button } from '@client/src/components/ui/button';
import { Input } from '@client/src/components/ui/input';
import { Label } from '@client/src/components/ui/label';
import { useAuth } from '@client/src/contexts/AuthContext';

const AdminLoginPage: React.FC = () => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!username || !password) {
      toast.error('请输入用户名和密码');
      return;
    }

    setSubmitting(true);
    try {
      await login(username, password);
      toast.success('登录成功');
      navigate('/admin');
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : '登录失败，请检查账号密码';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[hsl(40_15%_97%)] px-4">
      <Card className="w-full max-w-md shadow-lg border-border">
        <CardHeader className="text-center pb-4">
          <div className="mb-4 flex justify-center">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'hsl(20 30% 25%)' }}
            >
              <Lock className="w-6 h-6 text-white" />
            </div>
          </div>
          <div
            className="text-sm font-medium tracking-widest"
            style={{ color: 'hsl(40 60% 55%)' }}
          >
            BEIDI 北迪
          </div>
          <CardTitle
            className="text-2xl font-semibold tracking-tight mt-2"
            style={{ color: 'hsl(20 30% 25%)' }}
          >
            管理后台
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="username">用户名</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setUsername(e.target.value)
                }
                placeholder="请输入用户名"
                autoComplete="username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">密码</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setPassword(e.target.value)
                }
                placeholder="请输入密码"
                autoComplete="current-password"
              />
            </div>
            <Button
              type="submit"
              className="w-full rounded-full transition-all duration-300"
              style={{
                backgroundColor: 'hsl(20 30% 25%)',
                color: 'hsl(40 20% 96%)',
              }}
              disabled={submitting}
            >
              <LogIn className="w-4 h-4" />
              {submitting ? '登录中...' : '登录'}
            </Button>
            <p className="text-xs text-center text-muted-foreground pt-2">
              默认账号：admin / admin123，建议登录后修改密码
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLoginPage;

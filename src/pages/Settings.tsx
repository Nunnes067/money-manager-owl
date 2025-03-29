
import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useQuery } from '@tanstack/react-query';
import { fetchCategories, addCategory, deleteCategory, updateCategory } from '@/services/financeService';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Plus, Edit, Trash, Tag, CircleX } from 'lucide-react';
import { Category } from '@/types/finance';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';

const Settings = () => {
  const { toast } = useToast();
  const [newCategory, setNewCategory] = useState({ name: '', color: '#4CAF50', icon: 'tag' });
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const { data: categories = [], isLoading, refetch } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories
  });

  const handleAddCategory = async () => {
    if (!newCategory.name) {
      toast({
        title: 'Erro',
        description: 'O nome da categoria é obrigatório',
        variant: 'destructive',
      });
      return;
    }

    try {
      await addCategory({
        name: newCategory.name,
        color: newCategory.color,
        icon: newCategory.icon,
        is_default: false,
      });

      toast({
        title: 'Categoria adicionada',
        description: 'A categoria foi adicionada com sucesso',
      });

      setNewCategory({ name: '', color: '#4CAF50', icon: 'tag' });
      setIsAddDialogOpen(false);
      refetch();
    } catch (error) {
      console.error('Erro ao adicionar categoria:', error);
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao adicionar a categoria',
        variant: 'destructive',
      });
    }
  };

  const handleEditCategory = async () => {
    if (!editingCategory || !editingCategory.name) {
      toast({
        title: 'Erro',
        description: 'O nome da categoria é obrigatório',
        variant: 'destructive',
      });
      return;
    }

    try {
      await updateCategory(editingCategory.id, {
        name: editingCategory.name,
        color: editingCategory.color,
        icon: editingCategory.icon,
      });

      toast({
        title: 'Categoria atualizada',
        description: 'A categoria foi atualizada com sucesso',
      });

      setEditingCategory(null);
      setIsEditDialogOpen(false);
      refetch();
    } catch (error) {
      console.error('Erro ao atualizar categoria:', error);
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao atualizar a categoria',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteCategory = async (id: string) => {
    setIsDeleting(id);
    try {
      await deleteCategory(id);
      toast({
        title: 'Categoria excluída',
        description: 'A categoria foi excluída com sucesso',
      });
      refetch();
    } catch (error) {
      console.error('Erro ao excluir categoria:', error);
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao excluir a categoria',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(null);
    }
  };

  const colorOptions = [
    { value: '#4CAF50', label: 'Verde' },
    { value: '#2196F3', label: 'Azul' },
    { value: '#FF9800', label: 'Laranja' },
    { value: '#F44336', label: 'Vermelho' },
    { value: '#9C27B0', label: 'Roxo' },
    { value: '#00BCD4', label: 'Ciano' },
    { value: '#607D8B', label: 'Cinza' },
  ];

  const iconOptions = [
    { value: 'tag', label: 'Tag' },
    { value: 'shopping-cart', label: 'Carrinho de Compras' },
    { value: 'home', label: 'Casa' },
    { value: 'car', label: 'Carro' },
    { value: 'utensils', label: 'Alimentação' },
    { value: 'book', label: 'Educação' },
    { value: 'heart', label: 'Saúde' },
  ];

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Configurações</h1>
        </div>

        <Tabs defaultValue="categories">
          <TabsList className="grid grid-cols-2 mb-4 w-[400px]">
            <TabsTrigger value="categories">Categorias</TabsTrigger>
            <TabsTrigger value="account">Minha Conta</TabsTrigger>
          </TabsList>

          <TabsContent value="categories">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Categorias</CardTitle>
                  <CardDescription>
                    Gerencie as categorias para organizar suas transações
                  </CardDescription>
                </div>
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" /> Adicionar Categoria
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Adicionar Categoria</DialogTitle>
                      <DialogDescription>
                        Crie uma nova categoria para organizar suas transações
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div>
                        <Label htmlFor="name">Nome</Label>
                        <Input
                          id="name"
                          value={newCategory.name}
                          onChange={(e) =>
                            setNewCategory({ ...newCategory, name: e.target.value })
                          }
                          placeholder="Ex: Alimentação"
                        />
                      </div>
                      <div>
                        <Label htmlFor="color">Cor</Label>
                        <Select
                          value={newCategory.color}
                          onValueChange={(value) =>
                            setNewCategory({ ...newCategory, color: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {colorOptions.map((color) => (
                              <SelectItem key={color.value} value={color.value}>
                                <div className="flex items-center">
                                  <div
                                    className="w-4 h-4 rounded-full mr-2"
                                    style={{ backgroundColor: color.value }}
                                  />
                                  {color.label}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="icon">Ícone</Label>
                        <Select
                          value={newCategory.icon}
                          onValueChange={(value) =>
                            setNewCategory({ ...newCategory, icon: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {iconOptions.map((icon) => (
                              <SelectItem key={icon.value} value={icon.value}>
                                {icon.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                        Cancelar
                      </Button>
                      <Button onClick={handleAddCategory}>Adicionar</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {categories.length === 0 ? (
                    <div className="col-span-2 text-center py-10">
                      <Tag className="mx-auto h-12 w-12 text-muted-foreground opacity-50 mb-3" />
                      <h3 className="text-lg font-semibold mb-2">Nenhuma categoria personalizada</h3>
                      <p className="text-muted-foreground mb-4">
                        Você ainda não adicionou nenhuma categoria personalizada.
                      </p>
                    </div>
                  ) : (
                    categories.map((category: Category) => (
                      <div
                        key={category.id}
                        className="border rounded-lg p-4 flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-3">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: category.color || '#ccc' }}
                          >
                            <Tag className="h-4 w-4 text-white" />
                          </div>
                          <span>{category.name}</span>
                          {category.is_default && (
                            <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold">
                              Padrão
                            </span>
                          )}
                        </div>
                        {!category.is_default && (
                          <div className="flex space-x-2">
                            <Dialog open={isEditDialogOpen && editingCategory?.id === category.id} onOpenChange={(open) => {
                              setIsEditDialogOpen(open);
                              if (!open) setEditingCategory(null);
                            }}>
                              <DialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setEditingCategory(category)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Editar Categoria</DialogTitle>
                                  <DialogDescription>
                                    Altere os detalhes da categoria
                                  </DialogDescription>
                                </DialogHeader>
                                {editingCategory && (
                                  <div className="grid gap-4 py-4">
                                    <div>
                                      <Label htmlFor="edit-name">Nome</Label>
                                      <Input
                                        id="edit-name"
                                        value={editingCategory.name}
                                        onChange={(e) =>
                                          setEditingCategory({
                                            ...editingCategory,
                                            name: e.target.value,
                                          })
                                        }
                                      />
                                    </div>
                                    <div>
                                      <Label htmlFor="edit-color">Cor</Label>
                                      <Select
                                        value={editingCategory.color || '#4CAF50'}
                                        onValueChange={(value) =>
                                          setEditingCategory({
                                            ...editingCategory,
                                            color: value,
                                          })
                                        }
                                      >
                                        <SelectTrigger>
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {colorOptions.map((color) => (
                                            <SelectItem key={color.value} value={color.value}>
                                              <div className="flex items-center">
                                                <div
                                                  className="w-4 h-4 rounded-full mr-2"
                                                  style={{ backgroundColor: color.value }}
                                                />
                                                {color.label}
                                              </div>
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div>
                                      <Label htmlFor="edit-icon">Ícone</Label>
                                      <Select
                                        value={editingCategory.icon || 'tag'}
                                        onValueChange={(value) =>
                                          setEditingCategory({
                                            ...editingCategory,
                                            icon: value,
                                          })
                                        }
                                      >
                                        <SelectTrigger>
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {iconOptions.map((icon) => (
                                            <SelectItem key={icon.value} value={icon.value}>
                                              {icon.label}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </div>
                                )}
                                <DialogFooter>
                                  <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                                    Cancelar
                                  </Button>
                                  <Button onClick={handleEditCategory}>Salvar</Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>

                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <Trash className="h-4 w-4 text-destructive" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Tem certeza de que deseja excluir a categoria "{category.name}"?
                                    As transações com esta categoria serão preservadas, mas não poderão
                                    mais ser classificadas com ela.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteCategory(category.id)}
                                    className="bg-destructive hover:bg-destructive/90"
                                  >
                                    {isDeleting === category.id ? 
                                      <Loader2 className="h-4 w-4 animate-spin" /> : 
                                      'Excluir'
                                    }
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="account">
            <Card>
              <CardHeader>
                <CardTitle>Minha Conta</CardTitle>
                <CardDescription>
                  Gerencie as configurações da sua conta
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    disabled
                    value="usuario@exemplo.com"
                  />
                </div>

                <Button variant="outline">Alterar Senha</Button>
                
                <div className="pt-4 border-t">
                  <Button variant="destructive" className="w-full">
                    <CircleX className="h-4 w-4 mr-2" />
                    Excluir Conta
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Settings;

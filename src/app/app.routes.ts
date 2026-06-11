import { Routes } from '@angular/router';
import { AdminLayout} from './features/admin-side/admin-layout/admin-layout';
import { Category } from './features/admin-side/category/category';
import { AddProduct } from './features/admin-side/product/product';
import { Brand } from './features/admin-side/brand/brand';
import { Feature } from './features/admin-side/features/features';
export const routes: Routes = [
    { path: '', redirectTo: 'admin-side', pathMatch: 'full' },
  
  { path: 'admin-side', component: AdminLayout,children: [
    { path: '', redirectTo: 'category', pathMatch: 'full' },
    {path : 'category',component : Category},
    { path: 'add-product', component: AddProduct },
    {path  : 'brand',component: Brand},
    {path : 'features',component : Feature}
  ]},
];

import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SuperAdminService } from '../../services/super-admin.service';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-super-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './super-admin-dashboard.component.html',
  styleUrls: ['./super-admin-dashboard.component.css']
})
export class SuperAdminDashboardComponent implements OnInit {
  private superAdminService = inject(SuperAdminService);
  private route = inject(ActivatedRoute);
  
  users: any[] = [];
  filteredUsers: any[] = [];
  searchTerm: string = '';
  selectedRoleFilter: string = 'ALL';
  activeTab: 'users' | 'stats' = 'stats';
  stats: any = {
    totalUsers: 0,
    pendingApprovals: 0,
    totalTasks: 0,
    tasksByStatus: {}
  };
  
  loading = true;

  showUserForm = false;
  editingUser: any = null;
  userForm = {
    fullName: '',
    email: '',
    password: '',
    role: 'DEVELOPER'
  };

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['tab']) {
        this.activeTab = params['tab'] as 'users' | 'stats';
      }
    });
    this.loadData();
  }

  loadData() {
    this.loading = true;
    this.superAdminService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching users', err);
        this.loading = false;
      }
    });

    this.superAdminService.getStats().subscribe({
      next: (stats) => this.stats = stats,
      error: (err) => console.error('Error fetching stats', err)
    });
  }

  applyFilters() {
    this.filteredUsers = this.users.filter(user => {
      const matchesSearch = user.fullName.toLowerCase().includes(this.searchTerm.toLowerCase()) || 
                           user.email.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesRole = this.selectedRoleFilter === 'ALL' || user.role === this.selectedRoleFilter;
      return matchesSearch && matchesRole;
    });
  }

  openCreateForm() {
    this.editingUser = null;
    this.userForm = { fullName: '', email: '', password: '', role: 'DEVELOPER' };
    this.showUserForm = true;
  }

  openEditForm(user: any) {
    this.editingUser = user;
    this.userForm = { 
      fullName: user.fullName, 
      email: user.email, 
      password: '', 
      role: user.role 
    };
    this.showUserForm = true;
  }

  saveUser() {
    if (this.editingUser) {
      this.superAdminService.updateUser(this.editingUser.id, this.userForm).subscribe({
        next: () => {
          this.showUserForm = false;
          this.loadData();
        },
        error: (err) => console.error('Error updating user', err)
      });
    } else {
      this.superAdminService.createUser(this.userForm).subscribe({
        next: () => {
          this.showUserForm = false;
          this.loadData();
        },
        error: (err) => console.error('Error creating user', err)
      });
    }
  }

  approveUser(userId: number) {
    this.superAdminService.approveUser(userId).subscribe({
      next: () => {
        this.loadData();
      },
      error: (err) => console.error('Error approving user', err)
    });
  }

  deleteUser(userId: number) {
    if (confirm('Are you sure you want to delete this user?')) {
      this.superAdminService.deleteUser(userId).subscribe({
        next: () => {
          this.loadData();
        },
        error: (err) => console.error('Error deleting user', err)
      });
    }
  }

  getStatusKeys() {
    return Object.keys(this.stats.tasksByStatus || {});
  }

  getMaxTasks() {
    const counts = Object.values(this.stats.tasksByStatus || {}) as number[];
    return Math.max(...counts, 1);
  }
}

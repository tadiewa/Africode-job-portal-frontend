import { Component, OnInit, AfterViewInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartOptions } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Observable, of, forkJoin, combineLatest } from 'rxjs';
import { map, shareReplay, switchMap, tap } from 'rxjs/operators';
import { ApiService } from '../../../services/api.service';

interface Inquiry {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  companyName: string;
  projectType: string;
  projectBudget: number;
  projectTimeline: string;
  projectDesc: string;
  additionalNotes: string;
  developerId: string;
  status: 'SUBMITTED' | 'INPROGRESS' | 'COMPLETED';
  createdAt: string;
}

interface Developer {
  id: number;
  firstName: string;
}

interface InquirySummary {
  name: string;
  total: number;
  submitted: number;
  inProgress: number;
  completed: number;
}

@Component({
  selector: 'app-super-admin-dashboard',
  standalone: true,
  imports: [CommonModule, HttpClientModule, BaseChartDirective],
  templateUrl: './super-admin-dashboard.html',
  styleUrls: ['./super-admin-dashboard.scss'],
})
export class SuperAdminDashboard implements OnInit, AfterViewInit {
  submittedCount$!: Observable<number>;
  inProgressCount$!: Observable<number>;
  completedCount$!: Observable<number>;
  totalDevelopers$!: Observable<number>;

  topDevelopersTableData$!: Observable<InquirySummary[]>;

  inquiriesStatusData: ChartData<'pie', number[], string> = {
    labels: ['Submitted', 'In Progress', 'Completed'],
    datasets: [{ data: [] }],
  };

  pieChartOptions: ChartOptions<'pie'> = {
    responsive: true,
      maintainAspectRatio: false, // <-- Add this line
    plugins: {
      legend: { display: true, labels: { boxWidth: 12, boxHeight: 12 } },
      datalabels: { color: '#fff', formatter: (value: number) => value, font: { weight: 'bold', size: 12 } as any },
    },
  };
  pieChartPlugins = [ChartDataLabels];

  inquiriesOverTimeData: ChartData<'line', number[], string> = {
    labels: [],
    datasets: [{ data: [], label: 'Inquiries' }],
  };

  lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
      maintainAspectRatio: false, // <-- Add this line
    plugins: {
      tooltip: { callbacks: { label: (ctx) => `${ctx.dataset.label}: ${ctx.raw}` } },
      legend: { display: true },
    },
    scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
  };

  currentMonthName = '';
  isBrowser: boolean;
  isLoading = true;

  private allInquiries$!: Observable<Inquiry[]>;
  private allDevelopers$!: Observable<Developer[]>;

  constructor(private apiService: ApiService, @Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    this.currentMonthName = new Date().toLocaleString('default', { month: 'long' });
    this.loadDashboardData();
  }

  ngAfterViewInit(): void {
    // Note: Charts are now loaded via the `loadDashboardData` pipe,
    // so no need for this lifecycle hook anymore.
  }

  private loadDashboardData(): void {
    this.isLoading = true;

    // Use forkJoin to fetch both inquiries and developers in parallel
    const dashboardData$ = forkJoin({
      inquiries: this.apiService.get<{ content: Inquiry[] }>('api/inquiries/allInquiries?page=0&size=1000').pipe(map(res => res?.content || [])),
      developers: this.apiService.get<{ content: Developer[], totalElements: number }>('api/users/explore/devs?page=0&size=1000').pipe(map(res => res?.content || [])),
      totalDevs: this.apiService.get<{ totalElements: number }>('api/users/explore/devs?page=0&size=1').pipe(map(res => res?.totalElements || 0)),
    }).pipe(shareReplay(1));

    this.allInquiries$ = dashboardData$.pipe(map(data => data.inquiries));
    this.allDevelopers$ = dashboardData$.pipe(map(data => data.developers));
    this.totalDevelopers$ = dashboardData$.pipe(map(data => data.totalDevs));

    // Process counts, charts, and table data from the single data source
    this.allInquiries$.subscribe(inquiries => {
      // Counts
      const counts = [
        { status: 'Submitted', count: inquiries.filter(i => i.status === 'SUBMITTED').length },
        { status: 'In Progress', count: inquiries.filter(i => i.status === 'INPROGRESS').length },
        { status: 'Completed', count: inquiries.filter(i => i.status === 'COMPLETED').length },
      ];
      this.submittedCount$ = of(counts.find(c => c.status === 'Submitted')?.count || 0);
      this.inProgressCount$ = of(counts.find(c => c.status === 'In Progress')?.count || 0);
      this.completedCount$ = of(counts.find(c => c.status === 'Completed')?.count || 0);

      // Pie chart
      this.inquiriesStatusData = {
        labels: ['Submitted', 'In Progress', 'Completed'],
        datasets: [{ data: [counts[0].count, counts[1].count, counts[2].count] }],
      };

      // Line chart
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth();
      const weeksData = [0, 0, 0, 0];
      const weekLabels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];

      inquiries.forEach(i => {
        const date = new Date(i.createdAt);
        if (date.getFullYear() === year && date.getMonth() === month) {
          const weekIndex = Math.min(Math.floor((date.getDate() - 1) / 7), 3);
          weeksData[weekIndex]++;
        }
      });
      this.inquiriesOverTimeData = {
        labels: weekLabels,
        datasets: [{ data: weeksData, label: 'Inquiries' }],
      };
      
      this.isLoading = false;
    });

    // Load top developers table
    this.topDevelopersTableData$ = combineLatest([this.allInquiries$, this.allDevelopers$]).pipe(
      map(([inquiries, developers]) => {
        const devMap: { [id: string]: Inquiry[] } = {};
        inquiries.forEach(i => {
          if (!devMap[i.developerId]) devMap[i.developerId] = [];
          devMap[i.developerId].push(i);
        });
        
        const summaries: InquirySummary[] = developers.map(d => {
          const devInquiries = devMap[d.id] || [];
          return {
            name: d.firstName,
            total: devInquiries.length,
            submitted: devInquiries.filter(i => i.status === 'SUBMITTED').length,
            inProgress: devInquiries.filter(i => i.status === 'INPROGRESS').length,
            completed: devInquiries.filter(i => i.status === 'COMPLETED').length
          };
        });

        return summaries.sort((a, b) => b.total - a.total).slice(0, 5);
      })
    );
  }
}
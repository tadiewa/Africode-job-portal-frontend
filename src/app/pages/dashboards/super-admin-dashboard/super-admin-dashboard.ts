import { Component, OnInit, AfterViewInit, ChangeDetectorRef, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartOptions } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Observable, of } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
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

  // Counts
  submittedCount$!: Observable<number>;
  inProgressCount$!: Observable<number>;
  completedCount$!: Observable<number>;
  totalDevelopers$!: Observable<number>;
  inquiryCounts$!: Observable<{ status: string, count: number }[]>;
  inquiryTotal$!: Observable<number>;

  // Top Developers table
  topDevelopersTableData$!: Observable<InquirySummary[]>;

  // Pie Chart
  inquiriesStatusData: ChartData<'pie', number[], string> = {
    labels: ['Submitted', 'In Progress', 'Completed'],
    datasets: [{ data: [] }]
  };

  pieChartOptions: ChartOptions<'pie'> = {
    responsive: true,
    plugins: {
      legend: { display: true, labels: { boxWidth: 12, boxHeight: 12 } },
      datalabels: { color: '#fff', formatter: (value: number) => value, font: { weight: 'bold', size: 12 } as any }
    }
  };
  pieChartPlugins = [ChartDataLabels];

  // Line Chart
  inquiriesOverTimeData: ChartData<'line', number[], string> = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [{ data: [], label: 'Inquiries' }]
  };

  lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      tooltip: { callbacks: { label: (ctx) => `${ctx.dataset.label}: ${ctx.raw}` } },
      legend: { display: true }
    },
    scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
  };

  currentMonthName = '';
  isBrowser: boolean;
  isLoading = true;

  private allInquiries$!: Observable<Inquiry[]>;

  constructor(
    private apiService: ApiService,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    this.currentMonthName = new Date().toLocaleString('default', { month: 'long' });
    this.fetchAllInquiries();
    this.loadTotalDevelopers();
  }

  ngAfterViewInit(): void {
    if (this.isBrowser) {
      this.loadCharts();
      this.loadTopDevelopersTable();
    }
  }

  private fetchAllInquiries(): void {
    // Fetch all inquiries once, share the result to avoid multiple calls
    this.allInquiries$ = this.apiService
      .get<{ content: Inquiry[] }>('api/inquiries/allInquiries?page=0&size=1000')
      .pipe(map(res => res?.content || []), shareReplay(1));

    // Load counts
    this.inquiryCounts$ = this.allInquiries$.pipe(
      map(inquiries => [
        { status: 'Submitted', count: inquiries.filter(i => i.status === 'SUBMITTED').length },
        { status: 'In Progress', count: inquiries.filter(i => i.status === 'INPROGRESS').length },
        { status: 'Completed', count: inquiries.filter(i => i.status === 'COMPLETED').length },
      ])
    );

    this.submittedCount$ = this.inquiryCounts$.pipe(map(c => c.find(s => s.status === 'Submitted')?.count || 0));
    this.inProgressCount$ = this.inquiryCounts$.pipe(map(c => c.find(s => s.status === 'In Progress')?.count || 0));
    this.completedCount$ = this.inquiryCounts$.pipe(map(c => c.find(s => s.status === 'Completed')?.count || 0));
    this.inquiryTotal$ = this.inquiryCounts$.pipe(map(c => c.reduce((total, curr) => total + curr.count, 0)));
  }

  private loadTotalDevelopers(): void {
    this.totalDevelopers$ = this.apiService
      .get<{ totalElements: number }>('api/users/explore/devs?page=0&size=1')
      .pipe(map(res => res?.totalElements || 0));
  }

  private loadCharts(): void {
    this.allInquiries$.subscribe(inquiries => {
      // Pie chart
      this.inquiriesStatusData.datasets[0].data = [
        inquiries.filter(i => i.status === 'SUBMITTED').length,
        inquiries.filter(i => i.status === 'INPROGRESS').length,
        inquiries.filter(i => i.status === 'COMPLETED').length
      ];

      // Line chart: Weekly inquiries for current month
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth();
      const weeks = [0, 0, 0, 0];

      inquiries.forEach(i => {
        const date = new Date(i.createdAt);
        if (date.getFullYear() === year && date.getMonth() === month) {
          const weekIndex = Math.min(Math.floor((date.getDate() - 1) / 7), 3);
          weeks[weekIndex]++;
        }
      });

      this.inquiriesOverTimeData.datasets[0].data = weeks;
      this.isLoading = false;
      this.cdr.detectChanges();
    });
  }

  private loadTopDevelopersTable(): void {
    this.allInquiries$.subscribe(inquiries => {
      const devMap: { [id: string]: Inquiry[] } = {};
      inquiries.forEach(i => {
        if (!devMap[i.developerId]) devMap[i.developerId] = [];
        devMap[i.developerId].push(i);
      });

      this.apiService.get<{ content: { id: number; firstName: string }[] }>('api/users/explore/devs?page=0&size=1000')
        .subscribe(devRes => {
          const developers = devRes?.content || [];
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

          const top5 = summaries.sort((a, b) => b.total - a.total).slice(0, 5);
          this.topDevelopersTableData$ = of(top5);
        });
    });
  }
}

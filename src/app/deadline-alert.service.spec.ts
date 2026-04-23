import { TestBed } from '@angular/core/testing';

import { DeadlineAlertService } from './deadline-alert.service';

describe('DeadlineAlertService', () => {
  let service: DeadlineAlertService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DeadlineAlertService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

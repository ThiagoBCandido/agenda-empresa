import { TestBed } from '@angular/core/testing';

import { ApiNotesService } from './api-notes.service';

describe('ApiNotesService', () => {
  let service: ApiNotesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ApiNotesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

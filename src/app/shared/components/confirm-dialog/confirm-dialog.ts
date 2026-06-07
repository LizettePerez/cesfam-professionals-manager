import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SHARED_IMPORTS } from '../../material/shared-imports';
import { Professional } from '../../models/professional.model';
import { ProfessionalsService } from './../../../services/professionals.service';

@Component({
  selector: 'app-confirm-dialog',
  imports: [SHARED_IMPORTS],
  templateUrl: './confirm-dialog.html',
  styleUrl: './confirm-dialog.scss',
})
export class ConfirmDialog implements OnInit {
  // =========================
  // FORM
  // =========================
  searchControl = new FormControl<Professional | string | null>(null, {
    validators: [Validators.required],
  });
  specialtyControl = new FormControl<string | null>(null, {
    validators: [Validators.required],
  });

  professionals: Professional[] = [];
  filteredProfessionals: Professional[] = [];

  selectedProfessional: Professional | null = null;

  // =========================
  // FLAGS UI (IMPORTANTES)
  // =========================
  isExistingProfessional = false;
  isNewProfessional = false;
  isSaving = false;

  // =========================
  // BOX / SCHEDULE (TU HTML LOS USA)
  // =========================
  isSameBox = true;
  useSchedule = false;
  useOptionalSchedule = true;

  scheduleMain = {
    days: this.createDays(),
    start: null,
    end: null,
    box: '',
  };

  scheduleOptional = {
    days: this.createDays(),
    start: null,
    end: null,
    box: '',
  };

  constructor(
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<ConfirmDialog>,
    private cdr: ChangeDetectorRef,
    private professionalsService: ProfessionalsService,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      action: 'add' | 'edit' | 'delete';
      professional?: Professional;
      sectorId: number;
    },
  ) {}

  // =========================
  // INIT
  // =========================
  async ngOnInit() {
    await this.reloadProfessionals();

    this.filteredProfessionals = [...this.professionals];

    this.searchControl.valueChanges.subscribe((value) => {
      this.handleSearch(value);
      this.cdr.detectChanges();
    });

    this.cdr.detectChanges();
  }

  // =========================
  // SEARCH LOGIC (ESTABLE)
  // =========================
  private handleSearch(value: any) {
    const term =
      typeof value === 'string'
        ? value.toLowerCase().trim()
        : (value?.nombre ?? '').toLowerCase().trim();

    // reset
    if (!term) {
      this.filteredProfessionals = [...this.professionals];
      this.isExistingProfessional = false;
      this.isNewProfessional = false;
      return;
    }

    this.filteredProfessionals = this.professionals.filter((p) =>
      p.nombre.toLowerCase().includes(term),
    );

    const exactMatch = this.professionals.some((p) => p.nombre.toLowerCase() === term);

    this.isExistingProfessional = exactMatch;
    this.isNewProfessional = !exactMatch;

    if (typeof value !== 'string' && value) {
      this.selectedProfessional = value;
      this.specialtyControl.setValue(value.especialidad, { emitEvent: false });
      this.isExistingProfessional = true;
      this.isNewProfessional = false;
    }
  }

  // =========================
  // SELECT
  // =========================
  selectProfessional(p: Professional) {
    this.selectedProfessional = p;
    this.searchControl.setValue(p, { emitEvent: false });
    this.specialtyControl.setValue(p.especialidad, { emitEvent: false });

    this.isExistingProfessional = true;
    this.isNewProfessional = false;
  }

  clear() {
    this.searchControl.setValue('');
    this.filteredProfessionals = [...this.professionals];
    this.selectedProfessional = null;
    this.specialtyControl.reset();

    this.isExistingProfessional = false;
    this.isNewProfessional = false;
  }

  displayProfessional = (p: any): string => (p ? p.nombre : '');

  // =========================
  // BOX TOGGLES
  // =========================
  onSameBoxChange(event: any) {
    if (event.checked) {
      this.useSchedule = false;
    }
  }

  onScheduleChange(event: any) {
    if (event.checked) {
      this.isSameBox = false;
    }
  }

  // =========================
  // DAYS
  // =========================
  createDays() {
    return [
      { label: 'L', value: 'L', checked: false },
      { label: 'M', value: 'M', checked: false },
      { label: 'Mi', value: 'Mi', checked: false },
      { label: 'J', value: 'J', checked: false },
      { label: 'V', value: 'V', checked: false },
      { label: 'S', value: 'S', checked: false },
    ];
  }

  isDayDisabledInMain(dayValue: string): boolean {
    return this.scheduleOptional.days.some((d) => d.value === dayValue && d.checked);
  }

  isDayDisabledInOptional(dayValue: string): boolean {
    return this.scheduleMain.days.some((d) => d.value === dayValue && d.checked);
  }

  // =========================
  // SAVE
  // =========================
  async saveProfessional() {
    if (this.isSaving) return;
    const sector = this.data.sectorId;

    const nombre =
      typeof this.searchControl.value === 'string'
        ? this.searchControl.value
        : this.searchControl.value?.nombre;

    // 🔴 marcar como touched SIEMPRE antes de validar
    this.searchControl.markAsTouched();
    this.specialtyControl.markAsTouched();

    // 🔴 validación con return temprano
    if (!nombre || this.specialtyControl.invalid) {
      return;
    }

    this.isSaving = true;
    this.cdr.detectChanges();

    try {
      const payload = {
        nombre,
        especialidad: this.specialtyControl.value ?? undefined,
        sector: sector,
      };

      const created = await this.professionalsService.create(payload);

      await this.reloadProfessionals();

      this.selectedProfessional = created;

      this.searchControl.setValue(created, { emitEvent: false });
      this.specialtyControl.setValue(created.especialidad, { emitEvent: false });

      this.isExistingProfessional = true;
      this.isNewProfessional = false;

      this.snackBar.open('Profesional creado correctamente', 'Cerrar', {
        duration: 3000,
        panelClass: ['success-snackbar'],
      });
    } catch (e: any) {
      this.snackBar.open(e?.error?.message || 'Error al crear el profesional', 'Cerrar', {
        duration: 3000,
        panelClass: ['error-snackbar'],
      });
    } finally {
      this.isSaving = false;
      this.cdr.detectChanges();
    }
  }

  // =========================
  // LOAD
  // =========================
  async reloadProfessionals() {
    const sectorId = this.data.sectorId;
    console.log('SECTOR ACTUAL: ', sectorId);

    this.professionals = await this.professionalsService.getBySector(sectorId);
    this.filteredProfessionals = [...this.professionals];

    const currentName =
      typeof this.searchControl.value === 'string'
        ? this.searchControl.value
        : this.searchControl.value?.nombre;

    this.isExistingProfessional = this.professionals.some(
      (p) => p.nombre.toLowerCase() === (currentName ?? '').toLowerCase(),
    );

    this.cdr.detectChanges();
  }

  isDeleting = false;

  async deleteProfessional() {
    if (!this.data.professional) return;

    this.isDeleting = true;

    try {
      await this.professionalsService.deleteProfessional(this.data.professional.id);

      this.snackBar.open('Profesional eliminado correctamente', 'Cerrar', {
        duration: 3000,
        panelClass: ['success-snackbar'],
      });

      this.dialogRef.close({
        action: 'delete',
        professional: this.data.professional,
        success: true,
      });
    } catch (e: any) {
      this.snackBar.open(e?.error?.message || 'Error al eliminar profesional', 'Cerrar', {
        duration: 3000,
        panelClass: ['error-snackbar'],
      });
    } finally {
      this.isDeleting = false;
    }
  }
}

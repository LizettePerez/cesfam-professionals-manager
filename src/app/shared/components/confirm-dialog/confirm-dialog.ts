import { ChangeDetectorRef, Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
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
  boxMode: 'fixed' | 'time' | 'day' = 'fixed';

  setBoxMode(mode: 'fixed' | 'time' | 'day') {
    this.boxMode = mode;
  }

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
  ) {
    console.log('DATA: ', this.data);
  }

  // =========================
  // INIT
  // =========================
  async ngOnInit() {
    await this.reloadProfessionals();

    this.filteredProfessionals = [...this.professionals];

    // 🔥 EDIT MODE
    if (this.data.action === 'edit' && this.data.professional) {
      const p = this.data.professional;

      this.isExistingProfessional = true; // ✔️ esto es lo que manda

      this.selectedProfessional = p;

      this.searchControl.setValue(p, { emitEvent: false });
      this.searchControl.disable({ emitEvent: false });

      this.specialtyControl.setValue(p.especialidad, { emitEvent: false });
      this.specialtyControl.disable({ emitEvent: false });

      return;
    }

    // CREATE MODE
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
  // DAYS
  // =========================
  createDays() {
    return [
      { label: 'L', value: '0', checked: false },
      { label: 'M', value: '1', checked: false },
      { label: 'Mi', value: '2', checked: false },
      { label: 'J', value: '3', checked: false },
      { label: 'V', value: '4', checked: false },
      // { label: 'S', value: 5, checked: false },
    ];
  }

  isDayDisabledInOptional(dayValue: string): boolean {
    return this.scheduleMain.days.some((d) => d.value === dayValue && d.checked);
  }

  isDayDisabledInMain(dayValue: string): boolean {
    return this.scheduleOptional.days.some((d) => d.value === dayValue && d.checked);
  }

  // =========================
  // SAVE
  // =========================
  @Output() actionEvent = new EventEmitter<{
    action: 'create' | 'edit' | 'delete';
    professional?: Professional;
  }>();

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

      this.actionEvent.emit({
        action: 'create',
        professional: created,
      });

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

  async assignBox() {
    if (this.isSaving) return;
    this.isSaving = true;

    if (!this.selectedProfessional) {
      this.snackBar.open('Debes seleccionar un profesional', 'Cerrar', {
        duration: 3000,
        panelClass: ['error-snackbar'],
      });
      return;
    }

    const professional_id = this.selectedProfessional.id;

    let payload: any = {
      professional_id,
      box: null,
      start_time: null,
      end_time: null,
      days: null,
    };

    this.cdr.detectChanges();

    // =========================
    // FIXED MODE
    // =========================
    if (this.boxMode === 'fixed') {
      const box = this.scheduleMain.box?.trim();

      if (!box) {
        this.snackBar.open('Debes ingresar el box', 'Cerrar', {
          duration: 3000,
          panelClass: ['error-snackbar'],
        });
        return;
      }

      payload.box = box;
    }

    // =========================
    // TIME MODE
    // =========================
    if (this.boxMode === 'time') {
      const main = this.scheduleMain;

      if (!main.start || !main.end || !main.box) {
        this.snackBar.open('Completa horario y box principal', 'Cerrar', {
          duration: 3000,
          panelClass: ['error-snackbar'],
        });
        return;
      }

      const professional_id = this.selectedProfessional.id;

      this.isSaving = true;

      try {
        // =========================
        // 🔵 MAIN REQUEST
        // =========================
        await this.professionalsService.createSchedule({
          professional_id,
          box: main.box,
          start_time: main.start,
          end_time: main.end,
          days: null,
        });

        // =========================
        // 🔵 OPTIONAL REQUEST
        // =========================
        const opt = this.scheduleOptional;

        const hasOptional = opt.start && opt.end && opt.box;

        if (hasOptional) {
          await this.professionalsService.createSchedule({
            professional_id,
            box: opt.box,
            start_time: opt.start,
            end_time: opt.end,
            days: null,
          });
        }

        this.snackBar.open('Box asignado correctamente', 'Cerrar', {
          duration: 3000,
          panelClass: ['success-snackbar'],
        });

        this.dialogRef.close({
          action: 'edit',
          professional: this.data.professional,
          success: true,
        });
        this.cdr.detectChanges();
      } catch (e: any) {
        this.snackBar.open(e?.error?.message || 'Error al asignar box', 'Cerrar', {
          duration: 3000,
          panelClass: ['error-snackbar'],
        });
      } finally {
        this.isSaving = false;
        this.cdr.detectChanges();
      }
    }
    // =========================
    // DAY MODE
    // =========================
    if (this.boxMode === 'day') {
      const main = this.scheduleMain;

      const box = main.box;
      const days = main.days.filter((d) => d.checked).map((d) => d.value);

      if (!box || days.length === 0) {
        this.snackBar.open('Debes seleccionar días y box', 'Cerrar', {
          duration: 3000,
          panelClass: ['error-snackbar'],
        });
        return;
      }

      const professional_id = this.selectedProfessional.id;

      this.isSaving = true;

      try {
        // =========================
        // 🔵 MAIN REQUEST
        // =========================
        await this.professionalsService.createSchedule({
          professional_id,
          box: main.box,
          start_time: main.start,
          end_time: main.end,
          days: main.days.filter((d) => d.checked).map((d) => d.value), // 👈 STRING
        });

        // =========================
        // 🔵 OPTIONAL REQUEST
        // =========================
        const opt = this.scheduleOptional;

        const optDays = opt.days.filter((d) => d.checked).map((d) => d.value);

        const hasOptional = opt.box && optDays.length > 0;

        if (hasOptional) {
          await this.professionalsService.createSchedule({
            professional_id,
            box: opt.box,
            start_time: opt.start,
            end_time: opt.end,
            days: opt.days.filter((d) => d.checked).map((d) => d.value), // 👈 STRING
          });
        }

        this.snackBar.open('Box asignado correctamente', 'Cerrar', {
          duration: 3000,
          panelClass: ['success-snackbar'],
        });

        this.dialogRef.close({
          action: 'edit',
          professional: this.data.professional,
          success: true,
        });
      } catch (e: any) {
        this.snackBar.open(e?.error?.message || 'Error al asignar box', 'Cerrar', {
          duration: 3000,
          panelClass: ['error-snackbar'],
        });
      } finally {
        this.isSaving = false;
        this.cdr.detectChanges();
      }
    }

    this.isSaving = true;

    try {
      await this.professionalsService.createSchedule(payload);

      this.snackBar.open('Box asignado correctamente', 'Cerrar', {
        duration: 3000,
        panelClass: ['success-snackbar'],
      });

      this.dialogRef.close({
        action: 'edit',
        professional: this.data.professional,
        success: true,
      });
    } catch (e: any) {
      this.snackBar.open(e?.error?.message || 'Error al asignar box', 'Cerrar', {
        duration: 3000,
        panelClass: ['error-snackbar'],
      });
    } finally {
      this.isSaving = false;
      this.cdr.detectChanges();
    }
  }

  confirmDeleteProfessional() {
    const ok = confirm('¿Estás seguro de eliminar este profesional?');

    if (!ok) return;

    this.deleteProfessional();
  }

  async deleteSchedule() {
    this.isDeleting = true;

    try {
      const scheduleId = this.data.professional?.schedule_id;

      if (!scheduleId) {
        console.error('No schedule_id found');
        return;
      }

      await this.professionalsService.deleteSchedule(scheduleId);

      this.dialogRef.close({
        success: true,
        deleted: scheduleId,
      });
    } catch (error) {
      console.error('Error deleting schedule:', error);
    } finally {
      this.isDeleting = false;
    }
  }
}

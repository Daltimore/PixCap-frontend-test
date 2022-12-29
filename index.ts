interface Employee {
  uniqueId: number;
  name: string;
  subordinates: Employee[];
  }

  interface IEmployeeOrgApp {
    ceo: Employee;
  }

class EmployeeOrgApp implements IEmployeeOrgApp {
  ceo: Employee;
  employeeMap: Map<number, Employee>;
  moveHistory: Array<{employeeID: number, supervisorID: number, oldSupervisorID: number}>;
  currentHistoryIndex: number;

  constructor(ceo: Employee) {
    this.ceo = ceo;
    this.employeeMap = new Map<number, Employee>();
    this.moveHistory = [];
    this.currentHistoryIndex = -1;
    this.buildEmployeeMap(this.ceo);
  }

  buildEmployeeMap(employee: Employee) {
    this.employeeMap.set(employee.uniqueId, employee);
    for (const subordinate of employee.subordinates) {
      this.buildEmployeeMap(subordinate);
    }
  }

  move(employeeID: number, supervisorID: number) {
    const employee = this.employeeMap.get(employeeID);
    const supervisor = this.employeeMap.get(supervisorID);
    if (!employee || !supervisor) {
      throw new Error(`Invalid employee or supervisor ID`);
    }
    const oldSupervisor = this.getSupervisor(employee);
    this.removeFromSubordinates(oldSupervisor, employee);
    this.addToSubordinates(supervisor, employee);
    this.moveHistory.splice(this.currentHistoryIndex + 1);
    this.moveHistory.push({employeeID, supervisorID, oldSupervisorID: oldSupervisor.uniqueId});
    this.currentHistoryIndex++;
  }

  undo() {
    if (this.currentHistoryIndex < 0) {
      throw new Error(`No more actions to undo`);
    }
    const {employeeID, supervisorID, oldSupervisorID} = this.moveHistory[this.currentHistoryIndex];
    this.currentHistoryIndex--;
    this.move(employeeID, oldSupervisorID);
  }

  redo() {
    if (this.currentHistoryIndex >= this.moveHistory.length - 1) {
      throw new Error(`No more actions to redo`);
    }
    this.currentHistoryIndex++;
    const {employeeID, supervisorID} = this.moveHistory[this.currentHistoryIndex];
    this.move(employeeID, supervisorID);
  }

  getSupervisor(employee: Employee): Employee {
    for (const [id, e] of this.employeeMap.entries()) {
      if (e.subordinates.includes(employee)) {
        return e;
      }
    }
    throw new Error(`Employee is not part of the organization`);
  }

  removeFromSubordinates(supervisor: Employee, employee: Employee) {
    supervisor.subordinates = supervisor.subordinates.filter(e => e !== employee);
  }

  addToSubordinates(supervisor: Employee, employee: Employee) {
    supervisor.subordinates.push(employee);
  }
}

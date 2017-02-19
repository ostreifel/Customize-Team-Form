/// <reference types="../node_modules/vss-web-extension-sdk" />

import {
    IWorkItemNotificationListener,
    IWorkItemLoadedArgs,
    IWorkItemFieldChangedArgs,
    IWorkItemChangedArgs,
} from "TFS/WorkItemTracking/ExtensionContracts";
import {
    WorkItemFormService,
    IWorkItemFormService,
} from "TFS/WorkItemTracking/Services";
import { getClient } from "TFS/WorkItemTracking/RestClient";
import { WorkItemType, WorkItemField } from "TFS/WorkItemTracking/Contracts";
import { IPageForm, IFieldValues, IFieldDefintions } from "./pageContracts";
import { renderPage } from "./renderPage";

export class Page implements IWorkItemNotificationListener {
    public static create(container: JQuery): IPromise<Page> {
        return WorkItemFormService.getService().then(service => {
            return service.getFieldValue("System.WorkItemType").then((typeName: string) => {
                const projName = VSS.getWebContext().project.name;
                return getClient().getWorkItemType(projName, typeName).then(wit => {
                    return service.getFields().then(fields => {
                        return new Page(container, service, fields, wit);
                    });
                });
            });
        });
    }


    private readonly fieldDefinitions: IFieldDefintions = {};
    private constructor(readonly container: JQuery,
                        readonly service: IWorkItemFormService,
                        readonly witFields: WorkItemField[],
                        readonly wit: WorkItemType) {
        const fieldTypesDictionary: {[refName: string]: WorkItemField} = {};
        for (let field of this.witFields) {
            fieldTypesDictionary[field.referenceName] = field;
        }
        for (let field of this.wit.fieldInstances) {
            this.fieldDefinitions[field.referenceName] = {
                helpText: field.helpText,
                readonly: fieldTypesDictionary[field.referenceName].readOnly,
                type: fieldTypesDictionary[field.referenceName].type
            };
        }
    }
    public onLoaded(workItemLoadedArgs: IWorkItemLoadedArgs): void {
        this.service.getFields().then(fields => {});
        const mockForm: IPageForm = { version: "0.1.0", columns:[{
            groups: [{
                controls: [{
                    label: "Title Field",
                    referenceName: "System.Title",
                }],
            }],
        }]};
        const mockValues: IFieldValues = {
            "System.Title": "Sample Title",
        }
        renderPage(mockForm, this.fieldDefinitions, mockValues);
    }
    public onFieldChanged(fieldChangedArgs: IWorkItemFieldChangedArgs): void { }
    public onSaved(savedEventArgs: IWorkItemChangedArgs): void { }
    public onRefreshed(refreshEventArgs: IWorkItemChangedArgs): void { }
    public onReset(undoEventArgs: IWorkItemChangedArgs): void { }
    public onUnloaded(unloadedEventArgs: IWorkItemChangedArgs): void { }

}
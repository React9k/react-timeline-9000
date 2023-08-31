import React from 'react';
import { Menu, Popup } from 'semantic-ui-react';
import { IAction, IActionParamForRun } from './IAction';
import { createTestids } from '@famiprog-foundation/tests-are-demo';

type Point = { x: number, y: number };

type IParamsForAction = {
  selection: any[];
  [key: string]: any;
}
interface ContextMenuProps {
  actions: IAction[];

  paramsForAction: IParamsForAction;
  /**
   * if undefined => the menu is closed else {x, y} position where the menu should open
   */
  positionToOpen?: Point;
}

const testids = createTestids('ContextMenu', {
  popup: '',
  menuItem: ''  
});
export const contextMenuTestIds = testids;

export class ContextMenu extends React.Component<ContextMenuProps, { isOpened?: boolean }> {

  constructor(props) {
    super(props);
    this.close = this.close.bind(this);
    this.state = {
      isOpened: props.positionToOpen
    }
  }

  componentDidUpdate(prevProps: Readonly<ContextMenuProps>, prevState: Readonly<{}>, snapshot?: any): void {
    if (this.props.positionToOpen != prevProps.positionToOpen) {
      this.setState({ isOpened: this.props.positionToOpen ? true : false });
    }
  }

  close() {
    this.setState({ isOpened: false });
  }

  getPopupContext(): HTMLElement {
    const x = this.props.positionToOpen?.x;
    const y = this.props.positionToOpen?.y;
    return {
      getBoundingClientRect: () => ({
        left: x,
        top: y,
        right: x + 1,
        bottom: y + 1,
        height: 0,
        width: 0
      })
    } as HTMLElement;
  }

  getVisisbleActions(actions: IAction[]): IAction[] {
    return actions.filter(action => action.isVisible ? action.isVisible(this.props.paramsForAction) : true);
  }

  render() {
    const visibleActions = this.getVisisbleActions(this.props.actions);
    return <Popup basic wide='very' data-testid={testids.popup} context={this.getPopupContext()} 
                onClose={() => this.setState({ isOpened: false })} open={(this.state.isOpened && visibleActions.length > 0)}>
      <Menu className="rct9k-context-menu" secondary vertical>
        {visibleActions.map((action: IAction) => {
          const key = visibleActions.indexOf(action);
          return (!action.renderInMenu ?
            <Menu.Item
              data-testid={testids.menuItem + "_" + key} 
              key={key}
              icon={action.icon} 
              content={action.label instanceof Function ? action.label({ ...this.props.paramsForAction }) : action.label}
              onClick={() => {
                let params:IActionParamForRun = { ...this.props.paramsForAction, closeContextMenu: this.close }
                action.run && action.run(params);
                if (!params.dontCloseContextMenuAfterRunAutomatically) {
                  this.close();
                }
                }}>
            </Menu.Item>
            : React.cloneElement(action.renderInMenu({ ...this.props.paramsForAction, closeContextMenu: this.close }), {key: visibleActions.indexOf(action), "data-testid": testids.menuItem + "_" + key})
          );
        })
        }
      </Menu>
    </Popup>
  }
}

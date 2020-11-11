/**
 * visitor function used by JsonWalk
 * @param path jsonPath string
 * @param value current node value
 * @return boolean, true to stop walk deep
 */
export interface VisitorFunc {
    (path: string, value: any): boolean;
}
/**
 *
 * @param path jsonPath string
 * @param value current node value
 * @param visitor
 */
export declare const JsonWalk: (path: string, value: any, visitor: VisitorFunc) => void;

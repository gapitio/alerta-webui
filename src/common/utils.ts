export default {
  getAllowedScopes(scopes: string[], allScopes: string[]) {
    const derivedScopes: string[] = []

    function expandScope(scope: string) {
      return allScopes.filter(s => s.startsWith(scope))
    }

    for (const scope of scopes) {
      derivedScopes.push(...expandScope(scope))
      if (scope.startsWith('admin')) {
        derivedScopes.push(...expandScope(scope.replace('admin', 'delete')))
        derivedScopes.push(...expandScope(scope.replace('admin', 'write')))
        derivedScopes.push(...expandScope(scope.replace('admin', 'read')))
      }
      if (scope.startsWith('write')) {
        derivedScopes.push(...expandScope(scope.replace('write', 'read')))
      }
    }
    return Array.from(new Set(derivedScopes)).sort()
  },
  toHash(obj: object): string {
    return Object.entries(obj)
      .filter(x => {
        return !!x[1] && !(Object.prototype.toString.call(x[1]) === '[object Array]' && x[1].length < 1)
      })
      .reduce(
        (a: string[], [k, v]) =>
          a.concat(
            Object.prototype.toString.call(v) == '[object Object]'
              ? Object.keys(v).map(a => (v[a] != undefined ? `${k}.${a}:${v[a]}` : ''))
              : `${k}:${v}`
          ),
        []
      )
      .join(';')
  },
  fromHash(hash: string): {[key: string]: any} {
    const h = decodeURI(hash)
    return h
      ? h
          .split(';')
          .map(x => x.split(':'))
          .reduce((a, [k, v]) => Object.assign(a, {[k]: v}), {})
      : {}
  }
}

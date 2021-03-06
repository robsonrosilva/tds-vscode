import { isNull } from "util";

export interface IndentationRule {
	id: string;
	increment: boolean;
	decrement: boolean;
	reset: boolean;
	expression: RegExp;
	ignore_at?: string;
}

export interface RuleMatch {
	rule: IndentationRule;
}

export class FormattingRules {
	lastMatch: RuleMatch | null = null;

	private instanceOfRule(object: any): object is IndentationRule {
		return 'expression' in object;
	}

	public match(line: string): boolean {
		if (line.trim().length === 0) {
			return false;
		}

		let finddedRule: RuleMatch | null = null;

		this.getRules().every((rule: IndentationRule) => {
			if (this.instanceOfRule(rule)) {
				if (line.match(rule.expression)) {
					finddedRule = { rule: rule };
				}
			}

			return isNull(finddedRule);
		});

		if (!isNull(finddedRule)) {
			this.lastMatch = finddedRule;
			return true;
		}

		return false;
	}

	public getLastMatch(): RuleMatch | null {
		return this.lastMatch;
	}

	public getRules(): IndentationRule[] {
		return [...this.getRulesExpressions(), ...this.getCustomRules()];
	}

	private getCustomRules(): IndentationRule[] {
		return [];
	}

	// marcadores regexp utilizados
	// (\s+) = um ou mais whitespaces
	// (\w+) = uma ou mais letras/digitos => palavra
	// (constante) = constante (palavra chave)
	// (.*) =  qualquer coisa
	// ? = 0 ou mais ocorrências
	// ^ = inicio da linha
	// /i = ignorar caixa

	private getRulesExpressions(): IndentationRule[] {
		return [{
			id: 'function',
			expression: /^(\s*)((\w+)(\s+))?(function)(\s+)(\w+)/i,
			increment: true,
			decrement: false,
			reset: true
		}, {
			id: 'method',
			expression: /^(\s*)(method)(\s+)(\w+)(\s*)(.*)(\s+)(class)(\s+)(\w+)/i,
			increment: true,
			decrement: false,
			reset: true
		}, {
			id: 'comment line (start line)',
			expression: /^(\/\/)(.*)/i,
			increment: false,
			decrement: false,
			reset: false
		}, {
			id: '#ifdef/#ifndef',
			expression: /^(\s*)(#)(\s*)(ifdef|ifndef)/i,
			increment: true,
			decrement: false,
			reset: false
		}, {
			id: '#else',
			expression: /^(\s*)(#)(\s*)(else)/i,
			increment: true,
			decrement: true,
			reset: false
		},
		{
			id: '#endif',
			expression: /^(\s*)(#)(\s*)(endif)/i,
			increment: true,
			decrement: true,
			reset: false
		},
		{
			id: 'start comment block (start line)',
			expression: /^(\/\*)/i,
			increment: false,
			decrement: false,
			reset: false,
			ignore_at: 'end comment block (start line)'
		}, {
			id: 'end comment block (start line)' ,
			expression: /^(\*\/)/i,
			increment: false,
			decrement: false,
			reset: false
		},
		{
			id: 'begin report query',
			expression: /^(\s*)(begin)(\s+)(report)(\s+)(query)/i,
			increment: true,
			decrement: false,
			reset: false
		}, {
			id: 'end report query',
			expression: /^(\s*)(end)(\s+)(report)(\s+)(query)/i,
			increment: false,
			decrement: true,
			reset: false
		},
		{
			id: 'begin transaction',
			expression: /^(\s*)(begin)(\s+)(transaction)/i,
			increment: true,
			decrement: false,
			reset: false
		}, {
			id: "end transaction",
			expression: /^(\s*)(end)(\s+)(transaction)?/i,
			increment: false,
			decrement: true,
			reset: false
		},
		{
			id: 'beginsql (alias)?',
			expression: /^(\s*)(beginsql)(\s+)(\w+)/i,
			increment: true,
			decrement: false,
			reset: false
		}, {
			id: 'endsql',
			expression: /^(\s*)(endsql)/i,
			increment: false,
			decrement: true,
			reset: false
		},
		{
			id: 'do case',
			expression: /^(\s*)(do)(\s+)(case)/i,
			increment: true,
			decrement: false,
			reset: false
		}, {
			id: "case/otherwise",
			expression: /^(\s*)(case|otherwise)/i,
			increment: true,
			decrement: true,
			reset: false
		}, {
			id: "end case",
			expression: /^(\s*)(end)(\s*)(case)/i,
			increment: false,
			decrement: true,
			reset: false
		},
		{
			id: 'try',
			expression: /^(\s*)(try)/i,
			increment: true,
			decrement: false,
			reset: false
		}, {
			id: 'catch',
			expression: /^(\s*)(catch)/i,
			increment: true,
			decrement: true,
			reset: false
		}, {
			id: 'end try',
			expression: /^(\s*)(end)(\s*)(try)?/i,
			increment: false,
			decrement: true,
			reset: false
		},
		{
			id: 'class',
			expression: /^(\s*)(class)(\s+)(\w+)/i,
			increment: true,
			decrement: false,
			reset: false
		}, {
			id: "end class",
			expression: /^(\s*)(end)(\s*)(class)?/i,
			increment: false,
			decrement: true,
			reset: false
		},
		{
			id: 'wsclient',
			expression: /^(\s*)(wsclient)(\s+)(\w+)/i,
			increment: true,
			decrement: false,
			reset: false
		}, {
			id: 'end wsclient',
			expression: /^(\s*)(endwsclient)/i,
			increment: false,
			decrement: true,
			reset: false
		},
		{
			id: 'for',
			expression: /^(\s*)(for)(\s+)(\w+)/i,
			increment: true,
			decrement: false,
			reset: false
		}, {
			id: "next",
			expression: /^(\s*)(next)/i,
			increment: false,
			decrement: true,
			reset: false
		},
		{
			id: 'if',
			expression: /^(\s*)(if)(.*)+/i,
			increment: true,
			decrement: false,
			reset: false
		}, {
			id: 'else',
			expression: /^(\s*)((else)|(elseif))/i,
			increment: true,
			decrement: true,
			reset: false
		}, {
			id: 'endif',
			expression: /^(\s*)(end)(\s*)(if)?/i,
			increment: false,
			decrement: true,
			reset: false
		},
		{
			id: 'structure',
			expression: /^(\s*)(structure)/i,
			increment: true,
			decrement: false,
			reset: false
		}, {
			id: 'end structure',
			expression: /^(\s*)(end)(\s*)(structure)/i,
			increment: false,
			decrement: true,
			reset: false
		},
		{
			id: 'while',
			expression: /^(\s*)(do)?(\s*)(while)/i,
			increment: true,
			decrement: false,
			reset: false
		}, {
			id: "end do",
			expression: /^(\s*)(end)?(\s*)(do)/i,
			increment: false,
			decrement: true,
			reset: false
		},
		{
			id: 'wsrestful',
			expression: /^(\s*)(wsrestful)/i,
			increment: true,
			decrement: false,
			reset: false
		}, {
			id: "end wsrestful",
			expression: /^(\s*)(end)(\s*)(wsrestful)/i,
			increment: false,
			decrement: true,
			reset: false
		},
		{
			id: 'wsservice',
			expression: /^(\s*)(wsservice)/i,
			increment: true,
			decrement: false,
			reset: false
		}, {
			id: 'end wsservice',
			expression: /^(\s*)(end)(\s*)(wsservice)/i,
			increment: false,
			decrement: true,
			reset: false
		},
		{
			id: 'wsstruct',
			expression: /^(\s*)(wsstruct)/i,
			increment: true,
			decrement: false,
			reset: false
		}, {
			id: 'end wsstruct',
			expression: /^(\s*)(end)(\s*)(wsstruct)/i,
			increment: false,
			decrement: true,
			reset: false
		},
		{
			id: 'begin sequence',
			expression: /^(\s*)(begin)(\s*)(sequence)/i,
			increment: true,
			decrement: false,
			reset: false
		}, {
			id: 'recover',
			expression: /^(\s*)(recover)(\s*)(sequence)/i,
			increment: true,
			decrement: true,
			reset: false
		}, {
			id: 'end sequence',
			expression: /^(\s*)(end)(\s*)(sequence)?/i,
			increment: false,
			decrement: true,
			reset: false
		},
		{
			id: 'begin comment block',
			expression: /^(\s+)\/\*/i,
			increment: false,
			decrement: false,
			reset: false,
			ignore_at: 'end comment block'
		}, {
			id: 'end comment block',
			expression: /^(\s+)\*\//i,
			increment: false,
			decrement: false,
			reset: false
		}
		];
	}
}
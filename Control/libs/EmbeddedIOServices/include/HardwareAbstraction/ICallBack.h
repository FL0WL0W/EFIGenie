#include <list>
#include "stdint.h"

#ifndef ITASK_H
#define ITASK_H
namespace HardwareAbstraction
{
	class ICallBack
	{
	public:
		virtual void Execute() = 0;
	};
	
	struct CallBack : public ICallBack
	{
		CallBack(void(*callBackPointer)(void *), void *parameters)
		{
			CallBackPointer = callBackPointer;
			Parameters = parameters;
		}

		void Execute() override
		{
			CallBackPointer(Parameters);
		}

		void(*CallBackPointer)(void *);
		void *Parameters;
	};
	
	class CallBackGroup : public ICallBack
	{
	protected:
		std::list<ICallBack *> _callBackList;
	public:		
		void Execute() override;
		void Add(ICallBack *callBack);
		void Add(void(*callBackPointer)(void *), void *parameters);
		void Remove(ICallBack *callBack);
		void Clear();
	};
}
#endif

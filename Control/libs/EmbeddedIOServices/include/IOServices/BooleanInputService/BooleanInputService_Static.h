#include "IBooleanInputService.h"

#if !defined(BOOLEANINPUTSERVICE_STATIC_H) && defined(IBOOLEANINPUTSERVICE_H)
#define BOOLEANINPUTSERVICE_STATIC_H
namespace IOServices
{
	class BooleanInputService_Static : public IBooleanInputService
	{
	public:
		BooleanInputService_Static(const bool value) { Value = value; }
		
		void ReadValue() { };
	};
}
#endif
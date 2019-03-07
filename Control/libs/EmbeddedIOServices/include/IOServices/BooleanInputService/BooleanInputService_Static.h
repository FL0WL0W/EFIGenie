#include "IBooleanInputService.h"
#include "stdint.h"

#if !defined(BOOLEANINPUTSERVICE_STATIC_H) && defined(IBOOLEANINPUTSERVICE_H)
#define BOOLEANINPUTSERVICE_STATIC_H
namespace IOServices
{
	class BooleanInputService_Static : public IBooleanInputService
	{
	public:
		explicit BooleanInputService_Static(const bool value) { Value = value; }
		
		void ReadValue() override { };
	};
}
#endif

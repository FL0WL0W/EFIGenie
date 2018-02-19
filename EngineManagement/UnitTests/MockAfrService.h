namespace EngineManagement
{
	class MockAfrService : public IAfrService
	{
	public:
		MOCK_METHOD0(GetAfr, float());
	};
}
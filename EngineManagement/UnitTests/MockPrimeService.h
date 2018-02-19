namespace EngineManagement
{
	class MockPrimeService : public IPrimeService
	{
	public:
		MOCK_METHOD0(PrimeTick, void());
	};
}